const fs = require('fs');
const filePath = 'backend/server.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remove any trailing stray code blocks at the very end
content = content.replace(/app\.listen[\s\S]*$/, '').trim();

// Re-add a clean, single app.listen block
content += `

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Server file syntax cleaned successfully!');
