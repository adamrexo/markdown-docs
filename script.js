

document.addEventListener('DOMContentLoaded', async function () {
    const sidebar = document.getElementById('sidebar');
    const markdownContent = document.getElementById('markdown-content');
    const footerYear = document.getElementById('current-year');

    const sidebarData = await fetchSidebarData();
    const categories = parseSidebarData(sidebarData);

    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category', 'collapsed');

        if (category.category_name) {
            const categoryNameElement = document.createElement('a');
            categoryNameElement.classList.add('category-name');
            categoryNameElement.textContent = category.category_name;

            const toggleIcon = document.createElement('span');
            toggleIcon.classList.add('toggle-icon');
            toggleIcon.innerHTML = '&#9660;';

            categoryNameElement.appendChild(toggleIcon);
            categoryElement.appendChild(categoryNameElement);
        } else {
            categoryElement.classList.add('no-category');
        }

        const itemsContainer = document.createElement('div');
        itemsContainer.classList.add('items-container');
        categoryElement.appendChild(itemsContainer);

        categoryElement.addEventListener('click', (event) => {
            if (
                event.target.classList.contains('category-name') ||
                event.target.classList.contains('toggle-icon')
            ) {
                categoryElement.classList.toggle('collapsed');
            }
        });

        category.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.textContent = item.display_name || item.path;
            itemElement.classList.add('item');
            itemsContainer.appendChild(itemElement);

            itemElement.addEventListener('click', async () => {
                const markdownContentText = await fetchMarkdownContent(item.path);
                renderMarkdown(markdownContentText);
            });
        });

        sidebar.appendChild(categoryElement);
    });

    function fetchSidebarData() {
        return fetch('sidebar.md').then(response => response.text());
    }

    function parseSidebarData(data) {
        const lines = data.split('\n');
        const categories = [];
        let currentCategory = null;

        lines.forEach(line => {
            if (line.startsWith('*')) {
                const match = line.match(/\[([^)]+)\]\(([^)]+)\)/);
                if (match) {
                    const displayName = match[1];
                    const path = match[2];

                    if (currentCategory) {
                        currentCategory.items.push({ display_name: displayName, path });
                    } else {
                        categories.push({ items: [{ display_name: displayName, path }] });
                    }
                }
            } else if (line.startsWith('##')) {
                const categoryName = line.substring(3).trim();
                currentCategory = { category_name: categoryName, items: [] };
                categories.push(currentCategory);
            }
        });

        return categories;
    }

    function openFirstItemAutomatically() {
        const firstCategory = document.querySelector('.category');

        const firstItem = document.querySelector('.item');
        if (firstItem) {
            firstItem.click();
        }
    }

    openFirstItemAutomatically();

    async function fetchMarkdownContent(path) {
        const response = await fetch(path);
        return await response.text();
    }

    function renderMarkdown(markdownText) {
        const htmlContent = marked.parse(markdownText);

        markdownContent.innerHTML = DOMPurify.sanitize(htmlContent);
    }

    footerYear.textContent = new Date().getFullYear();
});
