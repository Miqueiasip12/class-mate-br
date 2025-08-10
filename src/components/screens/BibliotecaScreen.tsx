import { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { db } from '@/lib/database';
import { Disciplina, Materia } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function BibliotecaScreen() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(db.getDisciplinas());
  const [expandedDisciplina, setExpandedDisciplina] = useState<string | null>(null);
  const [showCreateDisciplinaSheet, setShowCreateDisciplinaSheet] = useState(false);
  const [showCreateMateriaSheet, setShowCreateMateriaSheet] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>('');
  const { toast } = useToast();

  // Form state
  const [disciplinaForm, setDisciplinaForm] = useState({ nome: '' });
  const [materiaForm, setMateriaForm] = useState({ nome: '', disciplinaId: '' });

  const refreshData = () => {
    setDisciplinas(db.getDisciplinas());
  };

  const handleCreateDisciplina = () => {
    if (!disciplinaForm.nome) {
      toast({
        title: "Erro",
        description: "Nome da disciplina é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      db.createDisciplina(disciplinaForm.nome);
      refreshData();
      setShowCreateDisciplinaSheet(false);
      setDisciplinaForm({ nome: '' });
      toast({
        title: "Sucesso",
        description: "Disciplina criada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar disciplina",
        variant: "destructive"
      });
    }
  };

  const handleEditDisciplina = () => {
    if (!editingDisciplina || !disciplinaForm.nome) {
      toast({
        title: "Erro",
        description: "Nome da disciplina é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      db.updateDisciplina(editingDisciplina.id, { nome: disciplinaForm.nome });
      refreshData();
      setEditingDisciplina(null);
      setDisciplinaForm({ nome: '' });
      toast({
        title: "Sucesso",
        description: "Disciplina atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar disciplina",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDisciplina = (disciplinaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta disciplina? Todas as matérias serão removidas.')) {
      try {
        // Delete all materias in this disciplina
        const materias = db.getMateriasByDisciplina(disciplinaId);
        materias.forEach(materia => db.deleteMateria(materia.id));
        
        // Delete disciplina
        db.deleteDisciplina(disciplinaId);
        refreshData();
        toast({
          title: "Sucesso",
          description: "Disciplina excluída com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir disciplina",
          variant: "destructive"
        });
      }
    }
  };

  const handleCreateMateria = () => {
    if (!materiaForm.nome || !materiaForm.disciplinaId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.createMateria(materiaForm.nome, materiaForm.disciplinaId);
      refreshData();
      setShowCreateMateriaSheet(false);
      setMateriaForm({ nome: '', disciplinaId: '' });
      toast({
        title: "Sucesso",
        description: "Matéria criada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar matéria",
        variant: "destructive"
      });
    }
  };

  const handleEditMateria = () => {
    if (!editingMateria || !materiaForm.nome || !materiaForm.disciplinaId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.updateMateria(editingMateria.id, { 
        nome: materiaForm.nome, 
        disciplinaId: materiaForm.disciplinaId 
      });
      refreshData();
      setEditingMateria(null);
      setMateriaForm({ nome: '', disciplinaId: '' });
      toast({
        title: "Sucesso",
        description: "Matéria atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar matéria",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMateria = (materiaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta matéria?')) {
      try {
        db.deleteMateria(materiaId);
        refreshData();
        toast({
          title: "Sucesso",
          description: "Matéria excluída com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir matéria",
          variant: "destructive"
        });
      }
    }
  };

  const openEditDisciplinaSheet = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina);
    setDisciplinaForm({ nome: disciplina.nome });
    setShowCreateDisciplinaSheet(true);
  };

  const openEditMateriaSheet = (materia: Materia) => {
    setEditingMateria(materia);
    setMateriaForm({ nome: materia.nome, disciplinaId: materia.disciplinaId });
    setShowCreateMateriaSheet(true);
  };

  const openCreateMateriaSheet = (disciplinaId: string) => {
    setSelectedDisciplinaId(disciplinaId);
    setMateriaForm({ nome: '', disciplinaId });
    setShowCreateMateriaSheet(true);
  };

  const closeDisciplinaSheet = () => {
    setShowCreateDisciplinaSheet(false);
    setEditingDisciplina(null);
    setDisciplinaForm({ nome: '' });
  };

  const closeMateriaSheet = () => {
    setShowCreateMateriaSheet(false);
    setEditingMateria(null);
    setMateriaForm({ nome: '', disciplinaId: '' });
    setSelectedDisciplinaId('');
  };

  const getMateriasByDisciplina = (disciplinaId: string) => {
    return db.getMateriasByDisciplina(disciplinaId);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Biblioteca</h2>
        <BookOpen className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Empty State */}
      {disciplinas.length === 0 ? (
        <Card className="p-8 text-center bg-gradient-card border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Nenhuma disciplina cadastrada
          </h3>
          <p className="text-muted-foreground mb-4">
            Organize seus recursos educacionais por disciplinas
          </p>
          <Button onClick={() => setShowCreateDisciplinaSheet(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Disciplina
          </Button>
        </Card>
      ) : (
        /* Disciplinas List */
        <div className="space-y-3">
          {disciplinas.map((disciplina) => {
            const materias = getMateriasByDisciplina(disciplina.id);
            const isExpanded = expandedDisciplina === disciplina.id;

            return (
              <Card key={disciplina.id} className="overflow-hidden bg-gradient-card border-border">
                <button
                  onClick={() => setExpandedDisciplina(isExpanded ? null : disciplina.id)}
                  className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Folder className="w-5 h-5 text-accent" />
                      <div>
                        <h3 className="font-semibold text-card-foreground">{disciplina.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {materias.length} {materias.length === 1 ? 'matéria' : 'matérias'}
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
                  <div className="border-t border-border bg-muted/20">
                    {/* Disciplina Actions */}
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreateMateriaSheet(disciplina.id)}
                          className="flex-1"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova Matéria
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDisciplinaSheet(disciplina)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDisciplina(disciplina.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {/* Materias List */}
                    {materias.length > 0 ? (
                      <div className="p-4 space-y-2">
                        {materias.map((materia) => (
                          <div
                            key={materia.id}
                            className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4 text-primary" />
                              <div>
                                <h4 className="font-medium text-card-foreground">{materia.nome}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {materia.arquivosPath.length} {materia.arquivosPath.length === 1 ? 'arquivo' : 'arquivos'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditMateriaSheet(materia)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMateria(materia.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground text-sm">Nenhuma matéria cadastrada</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowCreateDisciplinaSheet(true)} />

      {/* Create/Edit Disciplina Bottom Sheet */}
      <BottomSheet
        isOpen={showCreateDisciplinaSheet}
        onClose={closeDisciplinaSheet}
        title={editingDisciplina ? "Editar Disciplina" : "Nova Disciplina"}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Disciplina</Label>
            <Input
              id="nome"
              value={disciplinaForm.nome}
              onChange={(e) => setDisciplinaForm({ nome: e.target.value })}
              placeholder="Ex: Matemática"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={closeDisciplinaSheet} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={editingDisciplina ? handleEditDisciplina : handleCreateDisciplina}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {editingDisciplina ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Create/Edit Materia Bottom Sheet */}
      <BottomSheet
        isOpen={showCreateMateriaSheet}
        onClose={closeMateriaSheet}
        title={editingMateria ? "Editar Matéria" : "Nova Matéria"}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeMateria">Nome da Matéria</Label>
            <Input
              id="nomeMateria"
              value={materiaForm.nome}
              onChange={(e) => setMateriaForm({ ...materiaForm, nome: e.target.value })}
              placeholder="Ex: Álgebra Linear"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disciplina">Disciplina</Label>
            <Select 
              value={materiaForm.disciplinaId || selectedDisciplinaId} 
              onValueChange={(value) => setMateriaForm({ ...materiaForm, disciplinaId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
              <SelectContent>
                {disciplinas.map((disciplina) => (
                  <SelectItem key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={closeMateriaSheet} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={editingMateria ? handleEditMateria : handleCreateMateria}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {editingMateria ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}