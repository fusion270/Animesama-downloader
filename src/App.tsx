import { useState } from "react"
import { MainLayout as Layout } from "./components/Layout/MainLayout"
import { Sidebar } from "./components/Layout/Sidebar"
import { Animesama } from "./pages/Animesama"
import { Xalaflix } from "./pages/Xalaflix"
import { Downloads } from "./pages/Downloads"
import { Settings } from "./pages/Settings"
import { MyList } from "./pages/MyList"


export type Page = 'animesama' | 'xalaflix' | 'downloads' | 'settings' | 'mylist';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('animesama');

  const renderPage = () => {
    switch (currentPage) {
      case 'animesama':
        return <Animesama />;
      case 'xalaflix':
        return <Xalaflix />;
      case 'mylist':
        return <MyList />;
      case 'downloads':
        return <Downloads />;
      case 'settings':
        return <Settings />;
      default:
        return <Animesama />;
    }
  };

  return (
    <Layout sidebar={<Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />}>
      {renderPage()}
    </Layout>
  )
}

export default App
