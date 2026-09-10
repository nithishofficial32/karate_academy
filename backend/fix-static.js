const fs = require('fs');
const filePath = 'backend/server.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remove any old static handlers to prevent duplicates
content = content.replace(/app\.use\(express\.static\([\s\S]*?\-\>[\s\S]*?\)\);/g, '');
content = content.replace(/app\.use\(express\.static\([\s\S]*?\)\);/g, '');
content = content.replace(/app\.get\('\*'_[\s\S]*?\);\s*\});/g, '');

// Append clean static serving and catch-all logic right before app.listen
const staticCode = `
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});
`;

// Insert before app.listen
if (content.includes('app.listen')) {
    content = content.replace('app.listen', staticCode + '\n\napp.listen');
} else {
    content += staticCode;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Static file routing fixed in server.js!');
