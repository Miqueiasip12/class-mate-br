import { useState } from 'react';
import { ArrowLeft, Users, Plus, Upload, UserPlus, Edit, Trash2, Camera, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { db } from '@/lib/database';
import { Turma, Aluno } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { fileToBase64, validateImageFile, resizeImage } from '@/lib/imageUtils';

interface TurmaDetalhesScreenProps {
  turma: Turma;
  onBack: () => void;
}

export function TurmaDetalhesScreen({ turma, onBack }: TurmaDetalhesScreenProps) {
  const [alunos, setAlunos] = useState<Aluno[]>(db.getAlunosByTurma(turma.id));
  const [showAddStudentSheet, setShowAddStudentSheet] = useState(false);
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [showEnrollSheet, setShowEnrollSheet] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const { toast } = useToast();

  // Form states
  const [studentForm, setStudentForm] = useState({
    nome: '',
    foto: null as File | null
  });

  const [importText, setImportText] = useState('');
  const [availableStudents, setAvailableStudents] = useState<Aluno[]>([]);

  const escola = db.getEscola(turma.escolaId);

  const refreshAlunos = () => {
    setAlunos(db.getAlunosByTurma(turma.id));
  };

  const refreshAvailableStudents = () => {
    const allStudents = db.getAlunos();
    const enrolledIds = turma.alunoIds;
    setAvailableStudents(allStudents.filter(student => !enrolledIds.includes(student.id)));
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (validation) {
      toast({
        title: "Erro",
        description: validation,
        variant: "destructive"
      });
      return;
    }

    try {
      const resizedFile = await resizeImage(file, 400, 400, 0.8);
      setStudentForm({ ...studentForm, foto: resizedFile });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar imagem",
        variant: "destructive"
      });
    }
  };

  const handleCreateStudent = async () => {
    if (!studentForm.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do aluno é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      let fotoPath: string | undefined;
      
      if (studentForm.foto) {
        fotoPath = await fileToBase64(studentForm.foto);
      }

      const novoAluno = db.createAluno(studentForm.nome.trim(), fotoPath);
      db.addAlunoToTurma(turma.id, novoAluno.id);
      
      refreshAlunos();
      setShowAddStudentSheet(false);
      setStudentForm({ nome: '', foto: null });
      
      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar aluno",
        variant: "destructive"
      });
    }
  };

  const handleEditStudent = async () => {
    if (!editingAluno || !studentForm.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do aluno é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      let fotoPath = editingAluno.fotoPath;
      
      if (studentForm.foto) {
        fotoPath = await fileToBase64(studentForm.foto);
      }

      db.updateAluno(editingAluno.id, { 
        nome: studentForm.nome.trim(), 
        fotoPath 
      });
      
      refreshAlunos();
      setEditingAluno(null);
      setStudentForm({ nome: '', foto: null });
      
      toast({
        title: "Sucesso",
        description: "Aluno atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar aluno",
        variant: "destructive"
      });
    }
  };

  const handleImportStudents = async () => {
    if (!importText.trim()) {
      toast({
        title: "Erro",
        description: "Digite os nomes dos alunos",
        variant: "destructive"
      });
      return;
    }

    try {
      const names = importText
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (names.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum nome válido encontrado",
          variant: "destructive"
        });
        return;
      }

      let addedCount = 0;
      for (const name of names) {
        const novoAluno = db.createAluno(name);
        db.addAlunoToTurma(turma.id, novoAluno.id);
        addedCount++;
      }

      refreshAlunos();
      setShowImportSheet(false);
      setImportText('');
      
      toast({
        title: "Sucesso",
        description: `${addedCount} aluno(s) importado(s) com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao importar alunos",
        variant: "destructive"
      });
    }
  };

  const handleEnrollExistingStudent = (alunoId: string) => {
    try {
      db.addAlunoToTurma(turma.id, alunoId);
      refreshAlunos();
      refreshAvailableStudents();
      
      toast({
        title: "Sucesso",
        description: "Aluno matriculado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao matricular aluno",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStudent = (alunoId: string) => {
    if (window.confirm('Tem certeza que deseja remover este aluno da turma?')) {
      try {
        db.removeAlunoFromTurma(turma.id, alunoId);
        refreshAlunos();
        
        toast({
          title: "Sucesso",
          description: "Aluno removido da turma"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover aluno",
          variant: "destructive"
        });
      }
    }
  };

  const openEditStudent = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setStudentForm({ nome: aluno.nome, foto: null });
    setShowAddStudentSheet(true);
  };

  const openEnrollSheet = () => {
    refreshAvailableStudents();
    setShowEnrollSheet(true);
  };

  const handleCreateTurmaWithStudents = (selectedStudentIds: string[]) => {
    // This would be called from the parent component when creating a new turma
    // with pre-selected students from other classes
    selectedStudentIds.forEach(studentId => {
      db.addAlunoToTurma(turma.id, studentId);
    });
    refreshAlunos();
  };

  const closeAddStudentSheet = () => {
    setShowAddStudentSheet(false);
    setEditingAluno(null);
    setStudentForm({ nome: '', foto: null });
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{turma.nome}</h2>
          <p className="text-muted-foreground">{turma.disciplina} • {escola?.nome}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddStudentSheet(true)}
          className="flex flex-col items-center p-4 h-auto"
        >
          <UserPlus className="w-5 h-5 mb-1" />
          <span className="text-xs">Adicionar Aluno</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={openEnrollSheet}
          className="flex flex-col items-center p-4 h-auto"
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-xs">Matricular Existente</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportSheet(true)}
          className="flex flex-col items-center p-4 h-auto"
        >
          <Upload className="w-5 h-5 mb-1" />
          <span className="text-xs">Importar Lista</span>
        </Button>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Alunos ({alunos.length})
        </h3>

        {alunos.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-card border-border">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-card-foreground mb-2">
              Nenhum aluno matriculado
            </h4>
            <p className="text-muted-foreground mb-4">
              Adicione alunos para começar a fazer chamadas
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {alunos.map((aluno) => (
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
                    <p className="text-sm text-muted-foreground">
                      Adicionado em {new Date(aluno.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditStudent(aluno)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStudent(aluno.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Student Bottom Sheet */}
      <BottomSheet
        isOpen={showAddStudentSheet}
        onClose={closeAddStudentSheet}
        title={editingAluno ? "Editar Aluno" : "Novo Aluno"}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Aluno</Label>
            <Input
              id="nome"
              value={studentForm.nome}
              onChange={(e) => setStudentForm({ ...studentForm, nome: e.target.value })}
              placeholder="Digite o nome completo"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto">Foto do Aluno (opcional)</Label>
            <div className="flex items-center space-x-4">
              {(studentForm.foto || editingAluno?.fotoPath) && (
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={studentForm.foto ? URL.createObjectURL(studentForm.foto) : editingAluno?.fotoPath} 
                    alt="Preview" 
                  />
                  <AvatarFallback>
                    <Camera className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <Input
                  id="foto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG ou WebP. Máximo 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={closeAddStudentSheet} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={editingAluno ? handleEditStudent : handleCreateStudent}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {editingAluno ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Import Students Bottom Sheet */}
      <BottomSheet
        isOpen={showImportSheet}
        onClose={() => setShowImportSheet(false)}
        title="Importar Lista de Alunos"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importText">Lista de Nomes</Label>
            <Textarea
              id="importText"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Digite um nome por linha:&#10;João Silva&#10;Maria Santos&#10;Pedro Oliveira"
              rows={8}
              className="text-base resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Digite um nome por linha. Os alunos serão criados automaticamente.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowImportSheet(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleImportStudents} className="flex-1 bg-primary hover:bg-primary/90">
              Importar
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Enroll Existing Student Bottom Sheet */}
      <BottomSheet
        isOpen={showEnrollSheet}
        onClose={() => setShowEnrollSheet(false)}
        title="Matricular Aluno Existente"
      >
        <div className="p-4 space-y-4">
          {availableStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Todos os alunos cadastrados já estão matriculados nesta turma
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableStudents.map((aluno) => (
                <Card key={aluno.id} className="p-3 bg-gradient-card border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        {aluno.fotoPath ? (
                          <AvatarImage src={aluno.fotoPath} alt={aluno.nome} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {aluno.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium text-card-foreground">{aluno.nome}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEnrollExistingStudent(aluno.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Matricular
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline" onClick={() => setShowEnrollSheet(false)} className="w-full">
              Fechar
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}