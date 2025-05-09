import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Função auxiliar para formatar valores monetários
const formatCurrency = (value) => {
    if (typeof value !== 'number') {
        return value;
    }
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0, // Remove as casas decimais
        maximumFractionDigits: 0
    }).replace(",", "."); // Substitui a vírgula por ponto
};

function App() {
    const [imoveis, setImoveis] = useState([]);
    const [imoveisCarregados, setImoveisCarregados] = useState(false);
    const [nomeArquivo, setNomeArquivo] = useState("");
    const [erroArquivo, setErroArquivo] = useState(null);
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredImoveis, setFilteredImoveis] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            setErroArquivo("Nenhum arquivo selecionado.");
            setImoveis([]);
            setImoveisCarregados(false);
            setNomeArquivo("");
            return;
        }

        setErroArquivo(null);
        setImoveis([]);
        setImoveisCarregados(false);

        if (file.type !== "application/json") {
            setErroArquivo("Por favor, selecione um arquivo JSON (.json).");
            setNomeArquivo("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        setNomeArquivo(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const conteudo = JSON.parse(e.target.result);
                if (conteudo && Array.isArray(conteudo.data)) {
                    setImoveis(conteudo.data);
                    setImoveisCarregados(true);
                } else {
                    setErroArquivo("O arquivo JSON não contém uma estrutura de dados válida.");
                }
            } catch (error) {
                setErroArquivo("Erro ao processar o arquivo JSON.");
            }
        };

        reader.readAsText(file);
    };

    useEffect(() => {
        if (imoveisCarregados) {
            const results = imoveis.filter(imovel =>
                imovel.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredImoveis(results);
        }
    }, [imoveis, searchTerm, imoveisCarregados]);

    return (
        <div className="App">
            <h1>SuperExpansão Scraper</h1>
            <input type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} />
            {erroArquivo && <p className="erro">{erroArquivo}</p>}

            {imoveisCarregados && (
                <>
                    <input
                        type="text"
                        placeholder="Pesquisar por cidade..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-bar"
                    />
                    <div className="imoveis-grid">
                        {filteredImoveis.map((imovel, index) => (
                            <div key={index} className="imovel-card">
                                {imovel.image && (
                                    <img
                                        src={imovel.image}
                                        alt={imovel.streetAddress || 'imóvel'}
                                        style={{ width: '100%', height: '180px', objectFit: 'cover', marginBottom: '10px', borderRadius: '4px' }}
                                    />
                                )}
                                <h2>{imovel.streetAddress || 'Endereço não informado'}</h2>
                                <p><strong>Localização:</strong> {imovel.location || 'Não informada'}</p>
                                <p><strong>Preço:</strong> {imovel.price !== undefined ? formatCurrency(imovel.price) : 'Não informado'}</p>
                                <p><strong>IPTU:</strong> {imovel.iptuTax !== undefined ? formatCurrency(imovel.iptuTax) : 'Não informado'}</p>
                                <p><strong>Condomínio:</strong> {imovel.condominiumFee !== undefined ? formatCurrency(imovel.condominiumFee) : 'Não informado'}</p>
                                <p><strong>Tamanho:</strong> {imovel.size ? `${imovel.size} m²` : 'Não informado'}</p>
                                <p><strong>Banheiros:</strong> {imovel.numberOfBathrooms !== undefined ? imovel.numberOfBathrooms : 'Não informado'}</p>
                                <p><strong>Vagas:</strong> {imovel.numberOfParkingSpaces !== undefined ? imovel.numberOfParkingSpaces : 'Não informado'}</p>
                                {imovel.link && (
                                    <a
                                        href={imovel.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link-anuncio"
                                    >
                                        Ver Anúncio
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;