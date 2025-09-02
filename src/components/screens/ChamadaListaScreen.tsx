import { useState } from 'react';
import { ArrowLeft, Users, Check, X, MessageCircle, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { db } from '@/lib/database';
import { Turma, Aluno, Chamada } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { fileToBase64, validateImageFile, resizeImage } from '@/lib/imageUtils';

interface ChamadaListaScreenProps {
  turma: Turma;
  data: Date;
  onBack: () => void;
}

export function ChamadaListaScreen({ turma, data, onBack }: ChamadaListaScreenProps) {
  const [alunos] = useState<Aluno[]>(db.getAlunosByTurma(turma.id));
  const [attendanceMap, setAttendanceMap] = useState<Map<string, boolean>>(new Map());
  const [observationsMap, setObservationsMap] = useState<Map<string, string>>(new Map());
  const [showObservationSheet, setShowObservationSheet] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [currentObservation, setCurrentObservation] = useState('');
  const [conteudoAula, setConteudoAula] = useState('');
  const [classFotos, setClassFotos] = useState<File[]>([]);
  const { toast } = useToast();

  const dateString = data.toISOString().split('T')[0]; // YYYY-MM-DD format
  const escola = db.getEscola(turma.escolaId);

  // Load existing attendance data
  useState(() => {
    const existingAttendance = new Map<string, boolean>();
    const existingObservations = new Map<string, string>();
    
    alunos.forEach(aluno => {
      const chamada = db.getChamadaByAlunoTurmaData(aluno.id, turma.id, dateString);
      if (chamada) {
        existingAttendance.set(aluno.id, chamada.presente);
        if (chamada.observacao) {
          existingObservations.set(aluno.id, chamada.observacao);
        }
      }
    });
    
    setAttendanceMap(existingAttendance);
    setObservationsMap(existingObservations);

    // Load existing class content
    const existingContent = db.getConteudoAulaByTurmaData(turma.id, dateString);
    if (existingContent) {
      setConteudoAula(existingContent.conteudo);
    }
  });

  const setAttendance = (alunoId: string, presente: boolean) => {
    const newMap = new Map(attendanceMap);
    newMap.set(alunoId, presente);
    setAttendanceMap(newMap);

    // Save immediately
    try {
      db.createOrUpdateChamada(
        alunoId, 
        turma.id, 
        dateString, 
        presente, 
        observationsMap.get(alunoId)
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar presença",
        variant: "destructive"
      });
    }
  };

  const openObservationSheet = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    setCurrentObservation(observationsMap.get(alunoId) || '');
    setShowObservationSheet(true);
  };

  const saveObservation = () => {
    if (!selectedAlunoId) return;

    const newMap = new Map(observationsMap);
    if (currentObservation.trim()) {
      newMap.set(selectedAlunoId, currentObservation.trim());
    } else {
      newMap.delete(selectedAlunoId);
    }
    setObservationsMap(newMap);

    try {
      db.createOrUpdateChamada(
        selectedAlunoId,
        turma.id,
        dateString,
        attendanceMap.get(selectedAlunoId) ?? true,
        currentObservation.trim() || undefined
      );

      toast({
        title: "Sucesso",
        description: "Observação salva"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar observação",
        variant: "destructive"
      });
    }

    setShowObservationSheet(false);
    setSelectedAlunoId('');
    setCurrentObservation('');
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    
    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation) {
        toast({
          title: "Erro",
          description: `${file.name}: ${validation}`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const resizedFile = await resizeImage(file, 800, 600, 0.8);
        validFiles.push(resizedFile);
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao processar ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setClassFotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setClassFotos(prev => prev.filter((_, i) => i !== index));
  };

  const saveClassContent = async () => {
    try {
      const fotosPath: string[] = [];
      
      for (const foto of classFotos) {
        const base64 = await fileToBase64(foto);
        fotosPath.push(base64);
      }

      db.createOrUpdateConteudoAula(turma.id, dateString, conteudoAula, fotosPath);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo da aula salvo"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar conteúdo",
        variant: "destructive"
      });
    }
  };

  const getAttendanceStats = () => {
    const presente = Array.from(attendanceMap.values()).filter(Boolean).length;
    const total = alunos.length;
    const ausente = total - presente;
    return { presente, ausente, total };
  };

  const stats = getAttendanceStats();

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">Chamada</h2>
          <p className="text-muted-foreground">{turma.nome} • {turma.disciplina}</p>
          <p className="text-sm text-muted-foreground">
            {data.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <Card className="p-4 bg-gradient-card border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-success">{stats.presente}</div>
            <div className="text-sm text-muted-foreground">Presentes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">{stats.ausente}</div>
            <div className="text-sm text-muted-foreground">Ausentes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>
      </Card>

      {/* Students List */}
      <div className="space-y-3">
        {alunos.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-card border-border">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum aluno matriculado nesta turma
            </p>
          </Card>
        ) : (
          alunos.map((aluno) => {
            const isPresent = attendanceMap.get(aluno.id) ?? true;
            const hasObservation = observationsMap.has(aluno.id);

            return (
              <Card key={aluno.id} className="p-4 bg-gradient-card border-border">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    {aluno.fotoPath ? (
                      <AvatarImage src={aluno.fotoPath} alt={aluno.nome} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {aluno.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="font-semibold text-card-foreground">{aluno.nome}</h4>
                    {hasObservation && (
                      <p className="text-sm text-muted-foreground">
                        📝 {observationsMap.get(aluno.id)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openObservationSheet(aluno.id)}
                      className={cn(hasObservation && "text-accent")}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>

                    <div className="flex border border-border rounded-lg overflow-hidden">
                      <Button
                        variant={isPresent ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAttendance(aluno.id, true)}
                        className={cn(
                          "rounded-none px-3",
                          isPresent && "bg-success hover:bg-success/90 text-success-foreground"
                        )}
                      >
                        <Check className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline">P</span>
                      </Button>
                      <Button
                        variant={!isPresent ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAttendance(aluno.id, false)}
                        className={cn(
                          "rounded-none px-3",
                          !isPresent && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        )}
                      >
                        <X className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline">F</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Class Content */}
      <Card className="p-4 bg-gradient-card border-border">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          Conteúdo da Aula
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo ministrado</Label>
            <Textarea
              id="conteudo"
              value={conteudoAula}
              onChange={(e) => setConteudoAula(e.target.value)}
              placeholder="Descreva o conteúdo da aula..."
              rows={3}
              className="text-base resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fotos">Fotos da aula</Label>
            <Input
              id="fotos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="text-base"
            />
            
            {classFotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {classFotos.map((foto, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={saveClassContent} className="w-full bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Salvar Conteúdo
          </Button>
        </div>
      </Card>

      {/* Observation Bottom Sheet */}
      <BottomSheet
        isOpen={showObservationSheet}
        onClose={() => setShowObservationSheet(false)}
        title="Observação do Aluno"
      >
        <div className="p-4 space-y-4">
          {selectedAlunoId && (
            <div className="text-center">
              <h4 className="font-semibold text-card-foreground">
                {alunos.find(a => a.id === selectedAlunoId)?.nome}
              </h4>
              <p className="text-sm text-muted-foreground">
                {data.toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={currentObservation}
              onChange={(e) => setCurrentObservation(e.target.value)}
              placeholder="Digite sua observação sobre o aluno nesta aula..."
              rows={4}
              className="text-base resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowObservationSheet(false)} 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button onClick={saveObservation} className="flex-1 bg-primary hover:bg-primary/90">
              Salvar
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}