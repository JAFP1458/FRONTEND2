import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const DocumentSearch = () => {
  const [searchParams, setSearchParams] = useState({
    titulo: "",
    descripcion: "",
    usuarioId: "",
    tipoDocumentoId: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [documents, setDocuments] = useState([]);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get("/api/documents", { params: searchParams });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error searching documents:", error);
    }
  };

  const handleSelectDocument = (documentId) => {
    history.push(`/documents/${documentId}`);
  };

  return (
    <div>
      <h1>Buscar Documentos</h1>
      <div>
        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={searchParams.titulo}
          onChange={handleChange}
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={searchParams.descripcion}
          onChange={handleChange}
        />
        {/* Add other search fields similarly */}
        <button onClick={handleSearch}>Buscar</button>
      </div>
      <div>
        <h2>Resultados de la Búsqueda</h2>
        <ul>
          {documents.map((doc) => (
            <li key={doc.documentoid} onClick={() => handleSelectDocument(doc.documentoid)}>
              {doc.titulo}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentSearch;
