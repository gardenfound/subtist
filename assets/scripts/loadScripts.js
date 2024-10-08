document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    modal.style.display = 'none';
    const scriptsGrid = document.getElementById('scriptsGrid');
    const searchBar = document.getElementById('searchBar');
    const scriptAmount = document.getElementById('scriptAmount');
    const searchScope = document.getElementById('searchScope');
    const showEmptyScripts = document.getElementById('showEmptyScripts');
    const scriptLength = document.getElementById('scriptLength');
    const sortBy = document.getElementById('sortBy');
    const favoriteButton = document.getElementById('favoriteButton');
    const shareButton = document.getElementById('shareButton');

    const settingsMenuHeight = '160px';
    const customiseMenuHeight = '40px';
    const animText = getComputedStyle(document.body).getPropertyValue('--transition-speed');
    const animSpeed = parseFloat(animText) * 1000;    

    let favoriteScripts = JSON.parse(localStorage.getItem('favoriteScripts')) || [];

    document.getElementById('settingsButton').addEventListener('click', function () {
        var settingsMenu = document.getElementById('searchSettings');
        settingsMenu.style.height = (settingsMenu.style.height === settingsMenuHeight) ? '0px' : settingsMenuHeight;
        settingsMenu.style.opacity = (settingsMenu.style.height === settingsMenuHeight) ? '1' : '0';
    });

    document.getElementById('customiseButton').addEventListener('click', function () {
        var customiseMenu = document.getElementById('customiseSettings');
        customiseMenu.style.height = (customiseMenu.style.height === customiseMenuHeight) ? '0px' : customiseMenuHeight;
        customiseMenu.style.opacity = (customiseMenu.style.height === customiseMenuHeight) ? '1' : '0';
    });

    fetch('assets/data/scripts.json')
        .then(response => response.json())
        .then(data => {

            // check if its a shared link, if so open it!
            const hash = window.location.hash;
            if (hash) {
                openScriptByHash(hash);
            }

            shareButton.onclick = () => copyCurrentLink();

            function renderScripts(scripts) {
                scriptsGrid.innerHTML = '';
                scripts.forEach(script => {
                    const button = document.createElement('button');
                    const title = document.createElement('span');
                    const description = document.createElement('span');
                    const favoriteIcon = document.createElement('img');

                    title.textContent = script.name;
                    title.classList.add('gridButtonTitle');
                    description.textContent = script.description;
                    description.classList.add('gridButtonDescription');

                    favoriteIcon.src = 'assets/images/icons/favorite.png';
                    favoriteIcon.classList.add('favorite-icon');
                    if (favoriteScripts.includes(script.name)) {
                        favoriteIcon.classList.add('favorited');
                    }

                    button.appendChild(title);
                    button.appendChild(document.createElement('br'));
                    button.appendChild(description);
                    button.appendChild(favoriteIcon);

                    if (script.script === "") {
                        button.style.opacity = 0.35;
                        button.style.filter = "blur(1.2px)";
                    }

                    button.addEventListener('click', () => {

                        const kebabCaseName = script.name.toLowerCase().replace(/\s+/g, '-');
                        history.pushState(null, '', `#${kebabCaseName}`);

                        document.getElementById('scriptName').textContent = script.name;
                        document.getElementById('scriptDescription').textContent = script.description;
                        document.getElementById('scriptCode').textContent = script.script;
                        document.getElementById('copyButton').style.display = script.script == "" ? "none" : "block";
                        favoriteButton.classList.toggle('favorited', favoriteScripts.includes(script.name));
                        favoriteButton.onclick = () => toggleFavorite(script.name);

                        modal.style.display = "flex";
                        setTimeout(() => {
                            modal.classList.add('open');
                            modalContent.classList.add('open');
                        }, 5); // small delay otherwise the modal snaps in view for some reason???
                    });

                    scriptsGrid.appendChild(button);
                });

                scriptAmount.textContent = `${scripts.length} script${scripts.length !== 1 ? 's' : ''} found`;
            }

            function getWordCount(text) {
                return text.trim().split(/\s+/).length;
            }

            document.getElementById('randomButton').addEventListener('click', function () {
                const filteredScripts = data.scripts.filter(script => {
                    const searchValue = searchBar.value.toLowerCase();
                    const searchInTitle = script.name.toLowerCase().includes(searchValue);
                    const searchInDescription = script.description.toLowerCase().includes(searchValue);
                    const searchInScript = script.script.toLowerCase().includes(searchValue);
                    const searchScopeValue = searchScope.value;
                    const matchSearch = searchScopeValue === 'title' ? searchInTitle :
                        searchScopeValue === 'titleAndDescription' ? (searchInTitle || searchInDescription) :
                            (searchInTitle || searchInDescription || searchInScript);
                    const matchEmptyFilter = showEmptyScripts.checked || script.script !== "";
                    const wordCount = getWordCount(script.script);
                    const matchLength = scriptLength.value === 'all' ||
                        (scriptLength.value === 'short' && wordCount < 100) ||
                        (scriptLength.value === 'medium' && wordCount >= 100 && wordCount <= 250) ||
                        (scriptLength.value === 'long' && wordCount > 250);
                    return matchSearch && matchEmptyFilter && matchLength;
                });

                if (filteredScripts.length > 0) {
                    const randomScript = filteredScripts[Math.floor(Math.random() * filteredScripts.length)];

                    document.getElementById('scriptName').textContent = randomScript.name;
                    document.getElementById('scriptDescription').textContent = randomScript.description;
                    document.getElementById('scriptCode').textContent = randomScript.script;
                    document.getElementById('copyButton').style.display = randomScript.script == "" ? "none" : "block";
                    favoriteButton.classList.toggle('favorited', favoriteScripts.includes(randomScript.name));
                    favoriteButton.onclick = () => toggleFavorite(randomScript.name);

                    modal.style.display = "flex";
                    setTimeout(() => {
                        modal.classList.add('open');
                        modalContent.classList.add('open');
                    }, 5);
                }
            });

            function filterAndSortScripts() {
                const searchValue = searchBar.value.toLowerCase();
                let filteredScripts = data.scripts.filter(script => {
                    const searchInTitle = script.name.toLowerCase().includes(searchValue);
                    const searchInDescription = script.description.toLowerCase().includes(searchValue);
                    const searchInScript = script.script.toLowerCase().includes(searchValue);
                    const searchScopeValue = searchScope.value;
                    const matchSearch = searchScopeValue === 'title' ? searchInTitle :
                        searchScopeValue === 'titleAndDescription' ? (searchInTitle || searchInDescription) :
                            (searchInTitle || searchInDescription || searchInScript);
                    const matchEmptyFilter = showEmptyScripts.checked || script.script !== "";
                    const wordCount = getWordCount(script.script);
                    const matchLength = scriptLength.value === 'all' ||
                        (scriptLength.value === 'short' && wordCount < 100) ||
                        (scriptLength.value === 'medium' && wordCount >= 100 && wordCount <= 250) ||
                        (scriptLength.value === 'long' && wordCount > 250);
                    return matchSearch && matchEmptyFilter && matchLength;
                });

                if (sortBy.value === 'length') {
                    filteredScripts.sort((a, b) => getWordCount(b.script) - getWordCount(a.script));
                } else if (sortBy.value === 'alphabetical') {
                    filteredScripts.sort((a, b) => a.name.localeCompare(b.name));
                }

                // fav scripts on top
                filteredScripts.sort((a, b) => {
                    const aFavorited = favoriteScripts.includes(a.name);
                    const bFavorited = favoriteScripts.includes(b.name);
                    return bFavorited - aFavorited;
                });

                renderScripts(filteredScripts);
            }

            function toggleFavorite(scriptName) {
                if (favoriteScripts.includes(scriptName)) {
                    favoriteScripts = favoriteScripts.filter(name => name !== scriptName);
                } else {
                    favoriteScripts.push(scriptName);
                }
                localStorage.setItem('favoriteScripts', JSON.stringify(favoriteScripts));
                favoriteButton.classList.toggle('favorited', favoriteScripts.includes(scriptName));
                filterAndSortScripts();
            }

            function openScriptByHash(hash) {
                const scriptName = hash.slice(1).replace(/-/g, ' ');
                const script = data.scripts.find(s => s.name.toLowerCase() === scriptName);

                if (script) {
                    document.getElementById('scriptName').textContent = script.name;
                    document.getElementById('scriptDescription').textContent = script.description;
                    document.getElementById('scriptCode').textContent = script.script;
                    document.getElementById('copyButton').style.display = script.script == "" ? "none" : "block";
                    favoriteButton.classList.toggle('favorited', favoriteScripts.includes(script.name));
                    favoriteButton.onclick = () => toggleFavorite(script.name);

                    modal.style.display = "flex";
                    setTimeout(() => {
                        modal.classList.add('open');
                        modalContent.classList.add('open');
                    }, 5);
                }
            }

            searchBar.addEventListener('keyup', filterAndSortScripts);
            searchScope.addEventListener('change', filterAndSortScripts);
            showEmptyScripts.addEventListener('change', filterAndSortScripts);
            scriptLength.addEventListener('change', filterAndSortScripts);
            sortBy.addEventListener('change', filterAndSortScripts);

            renderScripts(data.scripts);
            filterAndSortScripts();
        });

    modal.addEventListener('click', (event) => {
        history.pushState(null, '', ` `);
        if (event.target === modal) {
            setTimeout(() => {
                modal.style.display = 'none';
            }, animSpeed);
            modal.classList.remove('open');
            modalContent.classList.remove('open');
        }
    });

    function copyCurrentLink() {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                showNotification('Link copied to clipboard', '#4caf50');
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
            });
    }


    document.getElementById('copyButton').addEventListener('click', () => {
        const scriptCode = document.getElementById('scriptCode');
        const range = document.createRange();
        range.selectNode(scriptCode);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        showNotification('Copied to clipboard', '#4caf50');
        window.getSelection().removeAllRanges();
    });
});
