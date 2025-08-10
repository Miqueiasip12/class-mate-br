import { useState } from 'react';
import { School, Plus, Edit, Trash2, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { db } from '@/lib/database';
import { Escola } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function EscolasScreen() {
  const [escolas, setEscolas] = useState<Escola[]>(db.getEscolas());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    nome: ''
  });

  const refreshEscolas = () => {
    setEscolas(db.getEscolas());
  };

  const handleCreateEscola = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da escola é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      db.createEscola(formData.nome.trim());
      refreshEscolas();
      setShowCreateSheet(false);
      setFormData({ nome: '' });
      toast({
        title: "Sucesso",
        description: "Escola criada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar escola",
        variant: "destructive"
      });
    }
  };

  const handleEditEscola = () => {
    if (!editingEscola || !formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da escola é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      db.updateEscola(editingEscola.id, { nome: formData.nome.trim() });
      refreshEscolas();
      setEditingEscola(null);
      setFormData({ nome: '' });
      toast({
        title: "Sucesso",
        description: "Escola atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar escola",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEscola = (escolaId: string) => {
    // Check if school has classes before deleting
    const turmas = db.getTurmas().filter(turma => turma.escolaId === escolaId);
    
    if (turmas.length > 0) {
      toast({
        title: "Erro",
        description: `Não é possível excluir. Esta escola possui ${turmas.length} turma(s) cadastrada(s).`,
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir esta escola?')) {
      try {
        db.deleteEscola(escolaId);
        refreshEscolas();
        toast({
          title: "Sucesso",
          description: "Escola excluída com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir escola",
          variant: "destructive"
        });
      }
    }
  };

  const openEditSheet = (escola: Escola) => {
    setEditingEscola(escola);
    setFormData({ nome: escola.nome });
    setShowCreateSheet(true);
  };

  const closeSheet = () => {
    setShowCreateSheet(false);
    setEditingEscola(null);
    setFormData({ nome: '' });
  };

  const getEscolaStats = (escolaId: string) => {
    const turmas = db.getTurmas().filter(turma => turma.escolaId === escolaId);
    const totalAlunos = turmas.reduce((total, turma) => {
      return total + db.getAlunosByTurma(turma.id).length;
    }, 0);
    
    return {
      turmasCount: turmas.length,
      alunosCount: totalAlunos
    };
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Escolas</h2>
        <School className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Empty State */}
      {escolas.length === 0 ? (
        <Card className="p-8 text-center bg-gradient-card border-border">
          <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Nenhuma escola cadastrada
          </h3>
          <p className="text-muted-foreground mb-4">
            Comece cadastrando sua primeira escola
          </p>
          <Button onClick={() => setShowCreateSheet(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Escola
          </Button>
        </Card>
      ) : (
        /* Escolas List */
        <div className="space-y-3">
          {escolas.map((escola) => {
            const { turmasCount, alunosCount } = getEscolaStats(escola.id);
            const isExpanded = expandedCard === escola.id;

            return (
              <Card key={escola.id} className="overflow-hidden bg-gradient-card border-border">
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : escola.id)}
                  className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <School className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground">{escola.nome}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{turmasCount} {turmasCount === 1 ? 'turma' : 'turmas'}</span>
                          </span>
                          <span>{alunosCount} {alunosCount === 1 ? 'aluno' : 'alunos'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Criada em {new Date(escola.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/20">
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditSheet(escola)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEscola(escola.id)}
                        className="flex-1"
                        disabled={turmasCount > 0}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                    
                    {turmasCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Para excluir esta escola, remova todas as turmas primeiro
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowCreateSheet(true)} />

      {/* Create/Edit Escola Bottom Sheet */}
      <BottomSheet
        isOpen={showCreateSheet}
        onClose={closeSheet}
        title={editingEscola ? "Editar Escola" : "Nova Escola"}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Escola</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ nome: e.target.value })}
              placeholder="Ex: Escola Municipal João Silva"
              className="text-base" // Prevents zoom on iOS
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={closeSheet} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={editingEscola ? handleEditEscola : handleCreateEscola}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {editingEscola ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}