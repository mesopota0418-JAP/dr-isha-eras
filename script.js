/**
 * Dr. Isha Eras - EBM Connection Logic
 * [V1.1: Gemini API Integration]
 */

// ⚠️ 注意: 本番環境（Vercel等）では環境変数を使用し、
// クライアント側にAPIキーを直接記述しないことがエビデンスに基づいた安全策です。
const API_KEY = 'YOUR_GOOGLE_AI_STUDIO_API_KEY'; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const chatContainer = document.getElementById('chat-container');
let conversationHistory = [];

/**
 * ユーザーの回答を処理し、APIを叩く
 */
async function handleAnswer(userResponse) {
    // 1. ユーザーの回答を画面に表示
    appendMessage('user', userResponse);
    
    // 会話履歴を更新
    conversationHistory.push({ role: "user", parts: [{ text: userResponse }] });

    // 2. ローディング演出（解析中...）
    const loadingDiv = appendMessage('ai', '解析中... データベースをデバッグしています...');

    try {
        // 3. Gemini APIへのリクエスト
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: conversationHistory,
                // システム命令をここに含める（またはAI Studio側で設定）
                system_instruction: {
                    parts: [{ text: "あなたはDr. Isha Erasです。格調高い古風な丁寧語を使い、エビデンスに基づいてガンの過剰診断などを指摘します。回答には必ず比較表(Markdown Table)を含めてください。" }]
                }
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        // 4. 解析完了：ローディングを消して結果を表示
        loadingDiv.remove();
        appendMessage('ai', formatMarkdown(aiText));
        
        // 履歴にAIの回答を追加
        conversationHistory.push({ role: "model", parts: [{ text: aiText }] });

    } catch (error) {
        loadingDiv.innerText = "エラー：通信プロトコルにバグが発生しました。ｗ";
        console.error(error);
    }
}

/**
 * メッセージをDOMに追加するユーティリティ
 */
function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}-message`;
    msgDiv.innerHTML = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgDiv;
}

/**
 * 簡易Markdownレンダラー（表をHTMLに変換）
 * 本格的な運用の場合は marked.js 等のライブラリ推奨
 */
function formatMarkdown(text) {
    // Markdownの表（|---|）をHTMLの<table>に簡易変換するパッチ
    if (text.includes('|')) {
        const lines = text.split('\n');
        let htmlTable = '<table>';
        lines.forEach((line, index) => {
            if (line.includes('|') && !line.includes('---')) {
                const cols = line.split('|').filter(c => c.trim() !== '');
                const tag = index === 0 ? 'th' : 'td';
                htmlTable += '<tr>' + cols.map(c