import { useState } from 'react';
import { Users, Plus, Edit, Trash2, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { db } from '@/lib/database';
import { Turma } from '@/types/database';
import { TurmaDetalhesScreen } from './TurmaDetalhesScreen';
import { useToast } from '@/hooks/use-toast';

export function TurmasScreen() {
  const [turmas, setTurmas] = useState<Turma[]>(db.getTurmas());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    disciplina: '',
    escolaId: ''
  });

  const escolas = db.getEscolas();

  const refreshTurmas = () => {
    setTurmas(db.getTurmas());
  };

  const handleCreateTurma = () => {
    if (!formData.nome || !formData.disciplina || !formData.escolaId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.createTurma(formData.nome, formData.disciplina, formData.escolaId);
      refreshTurmas();
      setShowCreateSheet(false);
      setFormData({ nome: '', disciplina: '', escolaId: '' });
      toast({
        title: "Sucesso",
        description: "Turma criada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar turma",
        variant: "destructive"
      });
    }
  };

  const handleEditTurma = () => {
    if (!editingTurma || !formData.nome || !formData.disciplina || !formData.escolaId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.updateTurma(editingTurma.id, {
        nome: formData.nome,
        disciplina: formData.disciplina,
        escolaId: formData.escolaId
      });
      refreshTurmas();
      setEditingTurma(null);
      setFormData({ nome: '', disciplina: '', escolaId: '' });
      toast({
        title: "Sucesso",
        description: "Turma atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar turma",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTurma = (turmaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      try {
        db.deleteTurma(turmaId);
        refreshTurmas();
        toast({
          title: "Sucesso",
          description: "Turma excluída com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir turma",
          variant: "destructive"
        });
      }
    }
  };

  const openEditSheet = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      disciplina: turma.disciplina,
      escolaId: turma.escolaId
    });
    setShowCreateSheet(true);
  };

  const closeSheet = () => {
    setShowCreateSheet(false);
    setEditingTurma(null);
    setFormData({ nome: '', disciplina: '', escolaId: '' });
  };

  const getTurmaDetails = (turma: Turma) => {
    const escola = db.getEscola(turma.escolaId);
    const alunosCount = db.getAlunosByTurma(turma.id).length;
    return { escola, alunosCount };
  };

  // Initialize with default school if none exists
  if (escolas.length === 0) {
    db.createEscola('Minha Escola');
  }

  // If viewing turma details, show that screen
  if (selectedTurma) {
    return (
      <TurmaDetalhesScreen 
        turma={selectedTurma} 
        onBack={() => setSelectedTurma(null)} 
      />
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Turmas</h2>
        <Users className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Empty State */}
      {turmas.length === 0 ? (
        <Card className="p-8 text-center bg-gradient-card border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Nenhuma turma cadastrada
          </h3>
          <p className="text-muted-foreground mb-4">
            Comece criando sua primeira turma
          </p>
          <Button onClick={() => setShowCreateSheet(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Turma
          </Button>
        </Card>
      ) : (
        /* Turmas List */
        <div className="space-y-3">
          {turmas.map((turma) => {
            const { escola, alunosCount } = getTurmaDetails(turma);
            const isExpanded = expandedCard === turma.id;

            return (
              <Card key={turma.id} className="overflow-hidden bg-gradient-card border-border">
                <div
                  onClick={() => setSelectedTurma(turma)}
                  className="w-full p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">{turma.nome}</h3>
                      <p className="text-sm text-muted-foreground">{turma.disciplina}</p>
                      <p className="text-sm text-muted-foreground">
                        {escola?.nome} • {alunosCount} alunos
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCard(isExpanded ? null : turma.id);
                        }}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/20">
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditSheet(turma)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTurma(turma.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowCreateSheet(true)} />

      {/* Create/Edit Turma Bottom Sheet */}
      <BottomSheet
        isOpen={showCreateSheet}
        onClose={closeSheet}
        title={editingTurma ? "Editar Turma" : "Nova Turma"}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Turma</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: 3º Ano A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disciplina">Disciplina</Label>
            <Input
              id="disciplina"
              value={formData.disciplina}
              onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
              placeholder="Ex: Matemática"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="escola">Escola</Label>
            <Select value={formData.escolaId} onValueChange={(value) => setFormData({ ...formData, escolaId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma escola" />
              </SelectTrigger>
              <SelectContent>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={closeSheet} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={editingTurma ? handleEditTurma : handleCreateTurma}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {editingTurma ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}