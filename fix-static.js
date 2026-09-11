const fs = require('fs');
const filePath = 'backend/server.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remove simple app.get('*') duplicates if any exist
content = content.replace(/app\.get\('\*',[\s\S]*?\);\s*\});/g, '');

const staticCode = `
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});
`;

if (!content.includes('express.static')) {
    if (content.includes('app.listen')) {
        content = content.replace('app.listen', staticCode + '\n\napp.listen');
    } else {
        content += staticCode;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Static routing added successfully!');
} else {
    console.log('Static routing already exists.');
}
