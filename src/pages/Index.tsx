import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ChamadaScreen } from '@/components/screens/ChamadaScreen';
import { TurmasScreen } from '@/components/screens/TurmasScreen';
import { CronogramaScreen } from '@/components/screens/CronogramaScreen';
import { EscolasScreen } from '@/components/screens/EscolasScreen';
import { BibliotecaScreen } from '@/components/screens/BibliotecaScreen';

const Index = () => {
  const [activeScreen, setActiveScreen] = useState('chamada');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'chamada':
        return <ChamadaScreen />;
      case 'turmas':
        return <TurmasScreen />;
      case 'cronograma':
        return <CronogramaScreen />;
      case 'escolas':
        return <EscolasScreen />;
      case 'biblioteca':
        return <BibliotecaScreen />;
      default:
        return <ChamadaScreen />;
    }
  };

  return (
    <Layout activeTab={activeScreen} onTabChange={setActiveScreen}>
      {renderScreen()}
    </Layout>
  );
};

export default Index;
