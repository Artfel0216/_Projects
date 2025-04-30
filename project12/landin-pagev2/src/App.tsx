import './App.css'
import HeaderLandinPageStart from './components/headerLandinPageStart'
import TextsLandinPage from './components/TextsLandinPage'
import ProjectManagment from './components/ProjectManagment'
import WorkTogether from './components/WorkTogether'
import Customise from './components/Customise'
import Chose from './components/chose'
import YouWork from './components/yourwork'
import Date from './components/date'
import Sponsors from './components/sponsors'
import Apps from './components/apps'
import Card from './components/Card'
import Footer from './components/footer'

function App() {

  return (
    <div>
     <HeaderLandinPageStart />
     <TextsLandinPage />
     <ProjectManagment />
      <WorkTogether />
      <Customise />
      <Chose />
      <YouWork />
      <Date />
      <Sponsors />
      <Apps />
      <Card />
      <Footer />
    </div>
  )
}

export default App
