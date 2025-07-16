const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton'); 
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

//Chave do API: AIzaSyAFvmTSn8xXlTxeDj5kSz9PSnDJzBfPRL4

const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`; 

    const perguntaLOL = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}.

    ## Tarefa
    Você deve responder perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
    - Considere a data atual ${new Date().toLocaleString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta 
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
    `; 

    const perguntaValorant = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo Valorant.

    ## Tarefa
    Você deve responder perguntas do usuário com base no seu conhecimento do jogo, estratégias, agentes, armas e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
    - Considere a data atual ${new Date().toLocaleString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta 
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor agente para iniciantes
    resposta: O melhor agente para iniciantes é o Brimstone, pois é fácil de usar e tem utilidades importantes para o time.

    ---
    Aqui está a pergunta do usuário: \${question}
    `;

    const perguntaCSGO = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo Counter-Strike: Global Offensive (CS:GO).

    ## Tarefa
    Você deve responder perguntas do usuário com base no seu conhecimento do jogo, estratégias, armas, mapas e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
    - Considere a data atual ${new Date().toLocaleString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta 
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor arma para eco round
    resposta: A melhor arma para eco round é a CZ75-Auto, pois é barata e eficiente em curta distância.

    ---
    Aqui está a pergunta do usuário: \${question}
    `;

    let pergunta = '';
    if (game === 'League of Legends') {
        pergunta = perguntaLOL.replace('${question}', question);
    } else if (game === 'Valorant') {
        pergunta = perguntaValorant.replace('${question}', question);
    } else if (game === 'CS:GO') {
        pergunta = perguntaCSGO.replace('${question}', question);
    } else {
        pergunta = `Aqui está a pergunta do usuário: ${question}`;
    }

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }];

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

const enviarFormulario = async (event) => { 
    event.preventDefault(); 
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey === '' || game === '' || question === '') {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading'); 

    try {
        const text = await perguntarAI(question, game, apiKey);
        aiResponse.querySelector('.response-text').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.log('Erro:', error);
    } finally {
        askButton.disabled = false;
        askButton.textContent = "Perguntar";
        askButton.classList.remove('loading');
    }
}

form.addEventListener('submit', enviarFormulario);