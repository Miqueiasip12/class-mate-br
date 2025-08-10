import { 
  Escola, 
  Turma, 
  Aluno, 
  Horario, 
  Chamada, 
  ConteudoAula, 
  Disciplina, 
  Materia 
} from '@/types/database';

const DB_PREFIX = 'teacher_agent_';

// Local storage database functions
export class LocalDatabase {
  private getStorageKey(boxName: string): string {
    return `${DB_PREFIX}${boxName}`;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Generic CRUD operations
  private getAll<T>(boxName: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(boxName));
    return data ? JSON.parse(data) : [];
  }

  private save<T>(boxName: string, items: T[]): void {
    localStorage.setItem(this.getStorageKey(boxName), JSON.stringify(items));
  }

  private add<T extends { id: string }>(boxName: string, item: T): void {
    const items = this.getAll<T>(boxName);
    items.push(item);
    this.save(boxName, items);
  }

  private updateGeneric<T extends { id: string }>(boxName: string, id: string, updates: Partial<T>): void {
    const items = this.getAll<T>(boxName);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.save(boxName, items);
    }
  }

  private delete<T extends { id: string }>(boxName: string, id: string): void {
    const items = this.getAll<T>(boxName);
    const filtered = items.filter(item => item.id !== id);
    this.save(boxName, filtered);
  }

  private getById<T extends { id: string }>(boxName: string, id: string): T | null {
    const items = this.getAll<T>(boxName);
    return items.find(item => item.id === id) || null;
  }

  // Escolas
  createEscola(nome: string): Escola {
    const escola: Escola = {
      id: this.generateId(),
      nome,
      createdAt: new Date().toISOString()
    };
    this.add('escolas', escola);
    return escola;
  }

  getEscolas(): Escola[] {
    return this.getAll<Escola>('escolas');
  }

  getEscola(id: string): Escola | null {
    return this.getById<Escola>('escolas', id);
  }

  updateEscola(id: string, updates: Partial<Escola>): void {
    this.updateGeneric('escolas', id, updates);
  }

  deleteEscola(id: string): void {
    this.delete('escolas', id);
  }

  // Turmas
  createTurma(nome: string, disciplina: string, escolaId: string): Turma {
    const turma: Turma = {
      id: this.generateId(),
      nome,
      disciplina,
      escolaId,
      alunoIds: [],
      createdAt: new Date().toISOString()
    };
    this.add('turmas', turma);
    return turma;
  }

  getTurmas(): Turma[] {
    return this.getAll<Turma>('turmas');
  }

  getTurma(id: string): Turma | null {
    return this.getById<Turma>('turmas', id);
  }

  updateTurma(id: string, updates: Partial<Turma>): void {
    this.updateGeneric('turmas', id, updates);
  }

  deleteTurma(id: string): void {
    this.delete('turmas', id);
  }

  addAlunoToTurma(turmaId: string, alunoId: string): void {
    const turma = this.getTurma(turmaId);
    if (turma && !turma.alunoIds.includes(alunoId)) {
      turma.alunoIds.push(alunoId);
      this.updateTurma(turmaId, turma);
    }
  }

  removeAlunoFromTurma(turmaId: string, alunoId: string): void {
    const turma = this.getTurma(turmaId);
    if (turma) {
      turma.alunoIds = turma.alunoIds.filter(id => id !== alunoId);
      this.updateTurma(turmaId, turma);
    }
  }

  // Alunos
  createAluno(nome: string, fotoPath?: string): Aluno {
    const aluno: Aluno = {
      id: this.generateId(),
      nome,
      fotoPath,
      createdAt: new Date().toISOString()
    };
    this.add('alunos', aluno);
    return aluno;
  }

  getAlunos(): Aluno[] {
    return this.getAll<Aluno>('alunos');
  }

  getAluno(id: string): Aluno | null {
    return this.getById<Aluno>('alunos', id);
  }

  updateAluno(id: string, updates: Partial<Aluno>): void {
    this.updateGeneric('alunos', id, updates);
  }

  deleteAluno(id: string): void {
    this.delete('alunos', id);
  }

  getAlunosByTurma(turmaId: string): Aluno[] {
    const turma = this.getTurma(turmaId);
    if (!turma) return [];
    
    const alunos = this.getAlunos();
    return alunos.filter(aluno => turma.alunoIds.includes(aluno.id));
  }

  // Horários
  createHorario(turmaId: string, diaDaSemana: number, horaInicio: string, horaFim: string): Horario {
    const horario: Horario = {
      id: this.generateId(),
      turmaId,
      diaDaSemana,
      horaInicio,
      horaFim,
      createdAt: new Date().toISOString()
    };
    this.add('horarios', horario);
    return horario;
  }

  getHorarios(): Horario[] {
    return this.getAll<Horario>('horarios');
  }

  getHorario(id: string): Horario | null {
    return this.getById<Horario>('horarios', id);
  }

  updateHorario(id: string, updates: Partial<Horario>): void {
    this.updateGeneric('horarios', id, updates);
  }

  deleteHorario(id: string): void {
    this.delete('horarios', id);
  }

  getHorariosByData(data: Date): Horario[] {
    const dayOfWeek = data.getDay() === 0 ? 7 : data.getDay(); // Convert Sunday from 0 to 7
    return this.getHorarios().filter(horario => horario.diaDaSemana === dayOfWeek);
  }

  // Chamada
  createOrUpdateChamada(alunoId: string, turmaId: string, data: string, presente: boolean, observacao?: string): Chamada {
    const id = `${alunoId}_${turmaId}_${data}`;
    const existingChamada = this.getChamada(id);
    
    if (existingChamada) {
      const updates: Partial<Chamada> = { presente, observacao };
      this.updateGeneric('chamadas', id, updates);
      return { ...existingChamada, ...updates };
    } else {
      const chamada: Chamada = {
        id,
        alunoId,
        turmaId,
        data,
        presente,
        observacao,
        createdAt: new Date().toISOString()
      };
      this.add('chamadas', chamada);
      return chamada;
    }
  }

  getChamadas(): Chamada[] {
    return this.getAll<Chamada>('chamadas');
  }

  getChamada(id: string): Chamada | null {
    return this.getById<Chamada>('chamadas', id);
  }

  getChamadaByAlunoTurmaData(alunoId: string, turmaId: string, data: string): Chamada | null {
    const id = `${alunoId}_${turmaId}_${data}`;
    return this.getChamada(id);
  }

  getChamadasByTurmaData(turmaId: string, data: string): Chamada[] {
    return this.getChamadas().filter(chamada => 
      chamada.turmaId === turmaId && chamada.data === data
    );
  }

  // Conteúdo da Aula
  createOrUpdateConteudoAula(turmaId: string, data: string, conteudo: string, fotosPath: string[] = []): ConteudoAula {
    const id = `${turmaId}_${data}`;
    const existing = this.getConteudoAula(id);
    
    if (existing) {
      const updates: Partial<ConteudoAula> = { conteudo, fotosPath };
      this.updateGeneric('conteudos', id, updates);
      return { ...existing, ...updates };
    } else {
      const conteudoAula: ConteudoAula = {
        id,
        turmaId,
        data,
        conteudo,
        fotosPath,
        createdAt: new Date().toISOString()
      };
      this.add('conteudos', conteudoAula);
      return conteudoAula;
    }
  }

  getConteudoAula(id: string): ConteudoAula | null {
    return this.getById<ConteudoAula>('conteudos', id);
  }

  getConteudoAulaByTurmaData(turmaId: string, data: string): ConteudoAula | null {
    const id = `${turmaId}_${data}`;
    return this.getConteudoAula(id);
  }

  // Disciplinas
  createDisciplina(nome: string): Disciplina {
    const disciplina: Disciplina = {
      id: this.generateId(),
      nome,
      createdAt: new Date().toISOString()
    };
    this.add('disciplinas', disciplina);
    return disciplina;
  }

  getDisciplinas(): Disciplina[] {
    return this.getAll<Disciplina>('disciplinas');
  }

  getDisciplina(id: string): Disciplina | null {
    return this.getById<Disciplina>('disciplinas', id);
  }

  updateDisciplina(id: string, updates: Partial<Disciplina>): void {
    this.updateGeneric('disciplinas', id, updates);
  }

  deleteDisciplina(id: string): void {
    this.delete('disciplinas', id);
  }

  // Matérias
  createMateria(nome: string, disciplinaId: string, arquivosPath: string[] = []): Materia {
    const materia: Materia = {
      id: this.generateId(),
      nome,
      disciplinaId,
      arquivosPath,
      createdAt: new Date().toISOString()
    };
    this.add('materias', materia);
    return materia;
  }

  getMaterias(): Materia[] {
    return this.getAll<Materia>('materias');
  }

  getMateria(id: string): Materia | null {
    return this.getById<Materia>('materias', id);
  }

  updateMateria(id: string, updates: Partial<Materia>): void {
    this.updateGeneric('materias', id, updates);
  }

  deleteMateria(id: string): void {
    this.delete('materias', id);
  }

  getMateriasByDisciplina(disciplinaId: string): Materia[] {
    return this.getMaterias().filter(materia => materia.disciplinaId === disciplinaId);
  }

  // Backup and Restore
  exportBackup(): string {
    const data = {
      escolas: this.getEscolas(),
      turmas: this.getTurmas(),
      alunos: this.getAlunos(),
      horarios: this.getHorarios(),
      chamadas: this.getChamadas(),
      conteudos: this.getAll<ConteudoAula>('conteudos'),
      disciplinas: this.getDisciplinas(),
      materias: this.getMaterias(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importBackup(backupData: string): void {
    try {
      const data = JSON.parse(backupData);
      
      // Clear existing data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(DB_PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      // Import new data
      if (data.escolas) this.save('escolas', data.escolas);
      if (data.turmas) this.save('turmas', data.turmas);
      if (data.alunos) this.save('alunos', data.alunos);
      if (data.horarios) this.save('horarios', data.horarios);
      if (data.chamadas) this.save('chamadas', data.chamadas);
      if (data.conteudos) this.save('conteudos', data.conteudos);
      if (data.disciplinas) this.save('disciplinas', data.disciplinas);
      if (data.materias) this.save('materias', data.materias);

    } catch (error) {
      throw new Error('Formato de backup inválido');
    }
  }
}

export const db = new LocalDatabase();