import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import DocsLayout from "./DocsLayout";
import Home from "./pages/Home";
import Examples from "./pages/Examples";
import SimpleWizard from "./pages/SimpleWizard";
import LegacyWizard from "./pages/LegacyWizard";
import RHFZodWizard from "./pages/RHFZodWizard";
import FormikYupWizard from "./pages/FormikYupWizard";
import ConditionalWizard from "./pages/ConditionalWizard";
import ComplexDataWizard from "./pages/ComplexDataWizard";
import AdvancedDemo from "./pages/AdvancedDemo";

import Introduction from "./pages/docs/Introduction";
import Installation from "./pages/docs/Installation";
import QuickStart from "./pages/docs/QuickStart";
import CoreConcepts from "./pages/docs/CoreConcepts";
import HooksApi from "./pages/docs/HooksApi";
import TypeReference from "./pages/docs/TypeReference";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="examples" element={<Examples />} />
        
        {/* Flat paths for examples (backward compatibility/legacy support) */}
        <Route path="simple" element={<SimpleWizard />} />
        <Route path="legacy" element={<LegacyWizard />} />
        <Route path="rhf-zod" element={<RHFZodWizard />} />
        <Route path="formik-yup" element={<FormikYupWizard />} />
        <Route path="conditional" element={<ConditionalWizard />} />
        <Route path="complex" element={<ComplexDataWizard />} />
        <Route path="advanced" element={<AdvancedDemo />} />

        {/* Documentation Section */}
        <Route path="docs" element={<DocsLayout />}>
          <Route index element={<Introduction />} />
          <Route path="introduction" element={<Introduction />} />
          <Route path="installation" element={<Installation />} />
          <Route path="quickstart" element={<QuickStart />} />
          
          <Route path="concepts" element={<CoreConcepts />} />
          <Route path="hooks" element={<HooksApi />} />
          <Route path="types" element={<TypeReference />} />
          <Route path="factory" element={<CoreConcepts />} />
          <Route path="steps" element={<CoreConcepts />} />
          
          {/* Placeholders for other docs */}
          <Route path="*" element={<Introduction />} />
        </Route>
      </Route>
      </Routes>
    </>
  );
}

export default App;
