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
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).replace(",", ".");
};

function App() {
    const [imoveis, setImoveis] = useState([]);
    const [imoveisCarregados, setImoveisCarregados] = useState(false);
    const [nomeArquivo, setNomeArquivo] = useState("");
    const [erroArquivo, setErroArquivo] = useState(null);
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredImoveis, setFilteredImoveis] = useState([]);
    const [titleWord, setTitleWord] = useState("Scraper");
    const words = ["Web Scraper", "Raspa Dados", "Quebra Imobiliaria"];
    const [wordIndex, setWordIndex] = useState(0);
    const [letterIndex, setLetterIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [pause, setPause] = useState(120);

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
                    setFilteredImoveis(conteudo.data);
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

    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        if (term === '') {
            setFilteredImoveis(imoveis);
        } else {
            const filtered = imoveis.filter(imovel =>
                imovel.location.toLowerCase().includes(term.toLowerCase()) ||
                imovel.streetAddress.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredImoveis(filtered);
        }
    };

    useEffect(() => {
        if (imoveis.length > 0) {
            setFilteredImoveis(imoveis);
        }
    }, [imoveis]);

    useEffect(() => {
        const timer = setTimeout(() => {
            let newTitleWord = titleWord;

            if (isDeleting) {
                if (letterIndex > 0) {
                    newTitleWord = titleWord.substring(0, letterIndex - 1);
                    setTitleWord(newTitleWord);
                    setLetterIndex(prevIndex => prevIndex - 1);
                } else {
                    setIsDeleting(false);
                    setIsTyping(true);
                    setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
                }
            } else if (isTyping) {
                if (letterIndex < words[wordIndex].length) {
                    newTitleWord = words[wordIndex].substring(0, letterIndex + 1);
                    setTitleWord(newTitleWord);
                    setLetterIndex(prevIndex => prevIndex + 1);
                } else {
                    setIsTyping(false);
                    setIsDeleting(true);
                    setLetterIndex(0);
                }
            }
        }, pause);

        return () => clearTimeout(timer);
    }, [letterIndex, isDeleting, isTyping, wordIndex, pause]);

    const titleStyle = {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '2em',
    };

    const changingWordStyle = {
        color: 'yellow',
        marginLeft: '0.2em',
        marginRight: '0.2em',
    };

    const pipeStyle = {
        color: 'white',
        marginRight: '0.1em', // Ajustei a margem para mais perto
    };

    return (
        <div className="App">
            <h1 style={titleStyle}>
                SuperExpansão
                <span style={changingWordStyle}>{titleWord}</span>
                <span style={pipeStyle}>|</span>
            </h1>
            <input type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} />
            {erroArquivo && <p className="erro">{erroArquivo}</p>}
            {nomeArquivo && <p>Arquivo selecionado: {nomeArquivo}</p>}

            {imoveisCarregados && (
                <>
                    <input
                        type="text"
                        placeholder="Buscar por Localização ou Endereço"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <div className="imoveis-grid">
                        {filteredImoveis.map(imovel => (
                            <div key={imovel._id} className="imovel-card">
                                {imovel.image && <img src={imovel.image} alt="Imóvel" />}
                                <p><strong>Localização:</strong> {imovel.location}</p>
                                <p><strong>Endereço:</strong> {imovel.streetAddress}</p>
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