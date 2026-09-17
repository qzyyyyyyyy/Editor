import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import EditPage from './pages/EditPage'
import ListPage from './pages/ListPage'
import PreviewPage from './pages/PreviewPage'
import RequireAuth from './components/RequireAuth'

export function App() {
  return (
   <Router>
     <Routes>
       <Route path="/" element={<RequireAuth />}>
        <Route index element={<EditPage />}></Route>
        <Route path="list" element={<ListPage />}></Route>
        <Route path="preview" element={<PreviewPage />}></Route>
       </Route>
     </Routes>
   </Router>
  )
}


