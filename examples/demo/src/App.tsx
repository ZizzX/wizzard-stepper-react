import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import SimpleWizard from './pages/SimpleWizard';
import RHFZodWizard from './pages/RHFZodWizard';
import FormikYupWizard from './pages/FormikYupWizard';
import ConditionalWizard from './pages/ConditionalWizard';
import ComplexDataWizard from './pages/ComplexDataWizard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="simple" element={<SimpleWizard />} />
        <Route path="rhf-zod" element={<RHFZodWizard />} />
        <Route path="formik-yup" element={<FormikYupWizard />} />
        <Route path="conditional" element={<ConditionalWizard />} />
        <Route path="complex" element={<ComplexDataWizard />} />
      </Route>
    </Routes>
  );
}

export default App;
