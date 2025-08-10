import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { db } from '@/lib/database';
import { Horario, Turma } from '@/types/database';
import { ChamadaListaScreen } from './ChamadaListaScreen';

export function ChamadaScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTurmaForAttendance, setSelectedTurmaForAttendance] = useState<{ turma: Turma; data: Date } | null>(null);

  // Get current month and year
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setSelectedDate(newDate);
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth && 
           selectedDate.getFullYear() === currentYear;
  };

  // Get scheduled classes for selected date
  const scheduledClasses = db.getHorariosByData(selectedDate);
  const turmas = db.getTurmas();

  const getClassesForDate = (): Array<{ horario: Horario; turma: Turma }> => {
    return scheduledClasses
      .map(horario => {
        const turma = turmas.find(t => t.id === horario.turmaId);
        return turma ? { horario, turma } : null;
      })
      .filter(Boolean) as Array<{ horario: Horario; turma: Turma }>;
  };

  const classesForSelectedDate = getClassesForDate();

  // If viewing attendance list, show that screen
  if (selectedTurmaForAttendance) {
    return (
      <ChamadaListaScreen 
        turma={selectedTurmaForAttendance.turma} 
        data={selectedTurmaForAttendance.data}
        onBack={() => setSelectedTurmaForAttendance(null)} 
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Chamada</h2>
        <Calendar className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Calendar Widget */}
      <Card className="p-4 bg-gradient-card border-border">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h3 className="text-lg font-semibold text-card-foreground">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => day && selectDate(day)}
              disabled={!day}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200",
                day && "hover:bg-muted",
                day && isSelected(day) && "bg-primary text-primary-foreground",
                day && isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground",
                !day && "invisible"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </Card>

      {/* Selected Date Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          {selectedDate.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>

        {/* Classes for Selected Date */}
        {classesForSelectedDate.length > 0 ? (
          <div className="space-y-3">
            {classesForSelectedDate.map(({ horario, turma }) => {
              const escola = db.getEscola(turma.escolaId);
              const alunosCount = db.getAlunosByTurma(turma.id).length;
              
              return (
                <Card key={horario.id} className="p-4 bg-gradient-card border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-card-foreground">{turma.nome}</h4>
                      <p className="text-sm text-muted-foreground">{turma.disciplina}</p>
                      <p className="text-sm text-muted-foreground">
                        {escola?.nome} • {alunosCount} alunos
                      </p>
                      <p className="text-sm text-accent font-medium">
                        {horario.horaInicio} - {horario.horaFim}
                      </p>
                    </div>
                    
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => {
                        setSelectedTurmaForAttendance({ turma, data: selectedDate });
                      }}
                    >
                      Fazer Chamada
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center bg-gradient-card border-border">
            <p className="text-muted-foreground">Nenhuma aula agendada para este dia</p>
          </Card>
        )}
      </div>
    </div>
  );
}