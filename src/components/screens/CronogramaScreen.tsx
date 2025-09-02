import { useState } from 'react';
import { Clock, Plus, Edit, Trash2, ChevronDown, ChevronRight, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { db } from '@/lib/database';
import { Horario, AulaAvulsa } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function CronogramaScreen() {
  const [horarios, setHorarios] = useState<Horario[]>(db.getHorarios());
  const [aulasAvulsas, setAulasAvulsas] = useState<AulaAvulsa[]>(db.getAulasAvulsas());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showCreateAulaAvulsaSheet, setShowCreateAulaAvulsaSheet] = useState(false);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [editingAulaAvulsa, setEditingAulaAvulsa] = useState<AulaAvulsa | null>(null);
  const { toast } = useToast();

  // Form state for regular schedule
  const [formData, setFormData] = useState({
    turmaId: '',
    diaDaSemana: '',
    horaInicio: '',
    horaFim: ''
  });

  // Form state for aula avulsa
  const [aulaAvulsaFormData, setAulaAvulsaFormData] = useState({
    turmaId: '',
    data: '',
    horaInicio: '',
    horaFim: ''
  });

  const turmas = db.getTurmas();

  const diasDaSemana = [
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' },
    { value: '7', label: 'Domingo' }
  ];

  const refreshHorarios = () => {
    setHorarios(db.getHorarios());
  };

  const refreshAulasAvulsas = () => {
    setAulasAvulsas(db.getAulasAvulsas());
  };

  const handleCreateAulaAvulsa = () => {
    if (!aulaAvulsaFormData.turmaId || !aulaAvulsaFormData.data || !aulaAvulsaFormData.horaInicio || !aulaAvulsaFormData.horaFim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.createAulaAvulsa(
        aulaAvulsaFormData.turmaId,
        aulaAvulsaFormData.data,
        aulaAvulsaFormData.horaInicio,
        aulaAvulsaFormData.horaFim
      );
      refreshAulasAvulsas();
      setShowCreateAulaAvulsaSheet(false);
      setAulaAvulsaFormData({ turmaId: '', data: '', horaInicio: '', horaFim: '' });
      toast({
        title: "Sucesso",
        description: "Aula avulsa criada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar aula avulsa",
        variant: "destructive"
      });
    }
  };

  const handleEditAulaAvulsa = () => {
    if (!editingAulaAvulsa || !aulaAvulsaFormData.turmaId || !aulaAvulsaFormData.data || !aulaAvulsaFormData.horaInicio || !aulaAvulsaFormData.horaFim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.updateAulaAvulsa(editingAulaAvulsa.id, {
        turmaId: aulaAvulsaFormData.turmaId,
        data: aulaAvulsaFormData.data,
        horaInicio: aulaAvulsaFormData.horaInicio,
        horaFim: aulaAvulsaFormData.horaFim
      });
      refreshAulasAvulsas();
      setEditingAulaAvulsa(null);
      setAulaAvulsaFormData({ turmaId: '', data: '', horaInicio: '', horaFim: '' });
      toast({
        title: "Sucesso",
        description: "Aula avulsa atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar aula avulsa",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAulaAvulsa = (aulaAvulsaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta aula avulsa?')) {
      try {
        db.deleteAulaAvulsa(aulaAvulsaId);
        refreshAulasAvulsas();
        toast({
          title: "Sucesso",
          description: "Aula avulsa excluída com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir aula avulsa",
          variant: "destructive"
        });
      }
    }
  };

  const openEditAulaAvulsaSheet = (aulaAvulsa: AulaAvulsa) => {
    setEditingAulaAvulsa(aulaAvulsa);
    setAulaAvulsaFormData({
      turmaId: aulaAvulsa.turmaId,
      data: aulaAvulsa.data,
      horaInicio: aulaAvulsa.horaInicio,
      horaFim: aulaAvulsa.horaFim
    });
    setShowCreateAulaAvulsaSheet(true);
  };

  const closeAulaAvulsaSheet = () => {
    setShowCreateAulaAvulsaSheet(false);
    setEditingAulaAvulsa(null);
    setAulaAvulsaFormData({ turmaId: '', data: '', horaInicio: '', horaFim: '' });
  };

  const handleCreateHorario = () => {
    if (!formData.turmaId || !formData.diaDaSemana || !formData.horaInicio || !formData.horaFim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.createHorario(
        formData.turmaId, 
        parseInt(formData.diaDaSemana), 
        formData.horaInicio, 
        formData.horaFim
      );
      refreshHorarios();
      setShowCreateSheet(false);
      setFormData({ turmaId: '', diaDaSemana: '', horaInicio: '', horaFim: '' });
      toast({
        title: "Sucesso",
        description: "Horário criado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar horário",
        variant: "destructive"
      });
    }
  };

  const handleEditHorario = () => {
    if (!editingHorario || !formData.turmaId || !formData.diaDaSemana || !formData.horaInicio || !formData.horaFim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      db.updateHorario(editingHorario.id, {
        turmaId: formData.turmaId,
        diaDaSemana: parseInt(formData.diaDaSemana),
        horaInicio: formData.horaInicio,
        horaFim: formData.horaFim
      });
      refreshHorarios();
      setEditingHorario(null);
      setFormData({ turmaId: '', diaDaSemana: '', horaInicio: '', horaFim: '' });
      toast({
        title: "Sucesso",
        description: "Horário atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar horário",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHorario = (horarioId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        db.deleteHorario(horarioId);
        refreshHorarios();
        toast({
          title: "Sucesso",
          description: "Horário excluído com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir horário",
          variant: "destructive"
        });
      }
    }
  };

  const openEditSheet = (horario: Horario) => {
    setEditingHorario(horario);
    setFormData({
      turmaId: horario.turmaId,
      diaDaSemana: horario.diaDaSemana.toString(),
      horaInicio: horario.horaInicio,
      horaFim: horario.horaFim
    });
    setShowCreateSheet(true);
  };

  const closeSheet = () => {
    setShowCreateSheet(false);
    setEditingHorario(null);
    setFormData({ turmaId: '', diaDaSemana: '', horaInicio: '', horaFim: '' });
  };

  const getHorarioDetails = (horario: Horario) => {
    const turma = db.getTurma(horario.turmaId);
    const escola = turma ? db.getEscola(turma.escolaId) : null;
    const diaNome = diasDaSemana.find(dia => dia.value === horario.diaDaSemana.toString())?.label || '';
    return { turma, escola, diaNome };
  };

  // Group horarios by day of week
  const horariosPorDia = diasDaSemana.map(dia => ({
    ...dia,
    horarios: horarios.filter(h => h.diaDaSemana === parseInt(dia.value))
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }));

  // Group aulas avulsas by date
  const aulasAvulsasOrdenadas = aulasAvulsas
    .sort((a, b) => {
      const dateComparison = a.data.localeCompare(b.data);
      if (dateComparison === 0) {
        return a.horaInicio.localeCompare(b.horaInicio);
      }
      return dateComparison;
    });

  const getAulaAvulsaDetails = (aulaAvulsa: AulaAvulsa) => {
    const turma = db.getTurma(aulaAvulsa.turmaId);
    const escola = turma ? db.getEscola(turma.escolaId) : null;
    const dataFormatada = new Date(aulaAvulsa.data + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return { turma, escola, dataFormatada };
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Cronograma</h2>
        <Clock className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Tabs for Regular Schedule and Special Classes */}
      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Horários Regulares
          </TabsTrigger>
          <TabsTrigger value="avulsa" className="flex items-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            Aulas Avulsas
          </TabsTrigger>
        </TabsList>

        {/* Regular Schedule Tab */}
        <TabsContent value="regular" className="mt-6">
          {horarios.length === 0 ? (
            <Card className="p-8 text-center bg-gradient-card border-border">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Nenhum horário cadastrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seus horários de aula regulares
              </p>
              <Button onClick={() => setShowCreateSheet(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Horário
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {horariosPorDia.map(dia => (
                <div key={dia.value}>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{dia.label}</h3>
                  
                  {dia.horarios.length === 0 ? (
                    <Card className="p-4 bg-gradient-card border-border opacity-50">
                      <p className="text-center text-muted-foreground">Nenhuma aula agendada</p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {dia.horarios.map(horario => {
                        const { turma, escola } = getHorarioDetails(horario);
                        const isExpanded = expandedCard === horario.id;

                        return (
                          <Card key={horario.id} className="overflow-hidden bg-gradient-card border-border">
                            <button
                              onClick={() => setExpandedCard(isExpanded ? null : horario.id)}
                              className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-card-foreground">
                                    {turma?.nome || 'Turma não encontrada'}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {turma?.disciplina} • {escola?.nome}
                                  </p>
                                  <p className="text-sm text-accent font-medium">
                                    {horario.horaInicio} - {horario.horaFim}
                                  </p>
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
                                    onClick={() => openEditSheet(horario)}
                                    className="flex-1"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteHorario(horario.id)}
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
                </div>
              ))}
            </div>
          )}

          {/* FAB for Regular Schedule */}
          <FloatingActionButton onClick={() => setShowCreateSheet(true)}>
            <Plus className="w-6 h-6" />
          </FloatingActionButton>
        </TabsContent>

        {/* Special Classes Tab */}
        <TabsContent value="avulsa" className="mt-6">
          {aulasAvulsasOrdenadas.length === 0 ? (
            <Card className="p-8 text-center bg-gradient-card border-border">
              <CalendarPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Nenhuma aula avulsa cadastrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie aulas em datas específicas que não fazem parte do cronograma regular
              </p>
              <Button onClick={() => setShowCreateAulaAvulsaSheet(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Aula Avulsa
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {aulasAvulsasOrdenadas.map(aulaAvulsa => {
                const { turma, escola, dataFormatada } = getAulaAvulsaDetails(aulaAvulsa);
                const isExpanded = expandedCard === aulaAvulsa.id;

                return (
                  <Card key={aulaAvulsa.id} className="overflow-hidden bg-gradient-card border-border">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : aulaAvulsa.id)}
                      className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-card-foreground">
                              {turma?.nome || 'Turma não encontrada'}
                            </h4>
                            <span className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded-md">
                              Avulsa
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {turma?.disciplina} • {escola?.nome}
                          </p>
                          <p className="text-sm text-accent font-medium">
                            {dataFormatada} • {aulaAvulsa.horaInicio} - {aulaAvulsa.horaFim}
                          </p>
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
                            onClick={() => openEditAulaAvulsaSheet(aulaAvulsa)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAulaAvulsa(aulaAvulsa.id)}
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

          {/* FAB for Special Classes */}
          <FloatingActionButton onClick={() => setShowCreateAulaAvulsaSheet(true)}>
            <CalendarPlus className="w-6 h-6" />
          </FloatingActionButton>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Horario Bottom Sheet */}
      <BottomSheet
        isOpen={showCreateSheet}
        onClose={closeSheet}
        title={editingHorario ? "Editar Horário" : "Novo Horário"}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="turma">Turma</Label>
            <Select value={formData.turmaId} onValueChange={(value) => setFormData({ ...formData, turmaId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.disciplina}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dia">Dia da Semana</Label>
            <Select value={formData.diaDaSemana} onValueChange={(value) => setFormData({ ...formData, diaDaSemana: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {diasDaSemana.map((dia) => (
                  <SelectItem key={dia.value} value={dia.value}>
                    {dia.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFim">Hora Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={formData.horaFim}
                onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={closeSheet} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={editingHorario ? handleEditHorario : handleCreateHorario}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {editingHorario ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Create/Edit Aula Avulsa Bottom Sheet */}
      <BottomSheet
        isOpen={showCreateAulaAvulsaSheet}
        onClose={closeAulaAvulsaSheet}
        title={editingAulaAvulsa ? "Editar Aula Avulsa" : "Nova Aula Avulsa"}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="turmaAvulsa">Turma</Label>
            <Select 
              value={aulaAvulsaFormData.turmaId} 
              onValueChange={(value) => setAulaAvulsaFormData({ ...aulaAvulsaFormData, turmaId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.disciplina}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAvulsa">Data</Label>
            <Input
              id="dataAvulsa"
              type="date"
              value={aulaAvulsaFormData.data}
              onChange={(e) => setAulaAvulsaFormData({ ...aulaAvulsaFormData, data: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaInicioAvulsa">Hora Início</Label>
              <Input
                id="horaInicioAvulsa"
                type="time"
                value={aulaAvulsaFormData.horaInicio}
                onChange={(e) => setAulaAvulsaFormData({ ...aulaAvulsaFormData, horaInicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFimAvulsa">Hora Fim</Label>
              <Input
                id="horaFimAvulsa"
                type="time"
                value={aulaAvulsaFormData.horaFim}
                onChange={(e) => setAulaAvulsaFormData({ ...aulaAvulsaFormData, horaFim: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={closeAulaAvulsaSheet} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={editingAulaAvulsa ? handleEditAulaAvulsa : handleCreateAulaAvulsa}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {editingAulaAvulsa ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}