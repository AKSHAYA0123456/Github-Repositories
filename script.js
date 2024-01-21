const defaultItemsPerPage = 10;
const maxItemsPerPage = 100;
let itemsPerPage = defaultItemsPerPage;
let currentPage = 1;
let allRepositories = [];

async function getRepositories() {
    const username = document.getElementById('username').value;
    const repositoriesContainer = document.getElementById('repositories');
    repositoriesContainer.innerHTML = '';

    try {
        showLoader();

        const response = await axios.get(`https://api.github.com/users/${username}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const user = response.data;
        const repositoriesResponse = await axios.get(user.repos_url);
        allRepositories = repositoriesResponse.data;

        if (allRepositories.length === 0) {
            repositoriesContainer.innerHTML = '<p class="no-repo-message">No repositories found for this user.</p>';
        } else {
            const profileCard = createProfileCard(user);
            const profileContainer = document.getElementById('profile-container');
            profileContainer.innerHTML = '';
            profileContainer.appendChild(profileCard);
            displayRepositories(allRepositories, currentPage);
        }
    } catch (error) {
        console.error('Error fetching GitHub data:', error.response || error);
        //repositoriesContainer.innerHTML = '<p class="error-message">Failed to fetch GitHub data.</p>';
    } finally {
        hideLoader();
    }
}

function showLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
}

function createProfileCard(user) {
    const profileCard = document.createElement('div');
    profileCard.className = 'profile-card';

    const profilePictureElement = document.createElement('img');
    profilePictureElement.src = user.avatar_url;
    profilePictureElement.alt = 'Profile Picture';
    profilePictureElement.className = 'profile-picture';

    const profileDetailsElement = document.createElement('div');
    profileDetailsElement.className = 'profile-details';

    const profileNameElement = document.createElement('div');
    profileNameElement.className = 'profile-name';
    profileNameElement.innerText = user.name || 'No Name';

    const profileBioElement = document.createElement('div');
    profileBioElement.className = 'profile-bio';
    profileBioElement.innerText = user.bio || 'No bio available';

    const profileLocationElement = document.createElement('div');
    profileLocationElement.className = 'profile-location';
    profileLocationElement.innerHTML = user.location ? `<i class="fas fa-map-marker-alt"></i> ${user.location}` : 'No location available';

    const profileTwitterElement = document.createElement('div');
    profileTwitterElement.className = 'profile-twitter';
    profileTwitterElement.innerHTML = user.twitter_username ?
        `<i class="fab fa-twitter"></i> <a href="https://twitter.com/${user.twitter_username}" target="_blank">Twitter</a>` :
        'No Twitter link available';

    const profileGitHubElement = document.createElement('div');
    profileGitHubElement.className = 'profile-github';
    profileGitHubElement.innerHTML = user.login ?
        `<i class="fab fa-github"></i> <a href="https://github.com/${user.login}" target="_blank">GitHub</a>` :
        'No GitHub link available';

    profileDetailsElement.appendChild(profileNameElement);
    profileDetailsElement.appendChild(profileBioElement);
    profileDetailsElement.appendChild(profileLocationElement);
    profileDetailsElement.appendChild(profileTwitterElement);
    profileDetailsElement.appendChild(profileGitHubElement);

    profileCard.appendChild(profilePictureElement);
    profileCard.appendChild(profileDetailsElement);

    return profileCard;
}

async function createRepositoryCard(repo) {
    const repoElement = document.createElement('div');
    repoElement.className = 'repository-card';

    const repoNameElement = document.createElement('div');
    repoNameElement.className = 'repository-name';
    repoNameElement.innerText = repo.name;

    const repoDescriptionElement = document.createElement('div');
    repoDescriptionElement.className = 'repository-description';
    repoDescriptionElement.innerText = repo.description || 'No description available';

    const languagesListElement = document.createElement('div');
    languagesListElement.className = 'languages-list';

    try {
        const languagesResponse = await axios.get(repo.languages_url);
        const languages = Object.keys(languagesResponse.data);

        languages.forEach(language => {
            const languageElement = document.createElement('span');
            languageElement.className = 'language';
            languageElement.style.backgroundColor = '#3579b8';
            languageElement.innerText = language;
            languagesListElement.appendChild(languageElement);
        });
    } catch (languagesError) {
        console.error('Error fetching repository languages:', languagesError);
    }

    repoElement.appendChild(repoNameElement);
    repoElement.appendChild(repoDescriptionElement);
    repoElement.appendChild(languagesListElement);

    return repoElement;
}

function displayRepositories(repositories, page) {
    const repositoriesContainer = document.getElementById('repositories');
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = repositories.slice(startIndex, endIndex);

    currentPageData.forEach(async repo => {
        const repoElement = await createRepositoryCard(repo);
        repositoriesContainer.appendChild(repoElement);
    });

    displayPagination(repositories.length, page);
}

function displayPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    const btnsContainer = document.getElementById('btns');
    paginationContainer.innerHTML = '';

    
    const chooseMaxContainer = document.createElement('div');
    chooseMaxContainer.className = 'choose-max-container';
    chooseMaxContainer.style.textAlign = 'start';
    chooseMaxContainer.style.marginBottom = '10px';

    
    const chooseMaxHeading = document.createElement('div');
    chooseMaxHeading.textContent = 'Choose maximum:';
    chooseMaxHeading.className = 'choose-max-heading';
    chooseMaxContainer.appendChild(chooseMaxHeading);


    const itemsPerPageDropdown = document.createElement('select');
    itemsPerPageDropdown.id = 'items-per-page';
    itemsPerPageDropdown.addEventListener('change', handleItemsPerPageChange);
    itemsPerPageDropdown.style.width = '150px'; 
    itemsPerPageDropdown.style.padding = '6px'; 


    for (let i = 10; i <= maxItemsPerPage; i += 10) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `${i} Repositories/Page`;
        itemsPerPageDropdown.appendChild(option);
    }

    itemsPerPageDropdown.value = itemsPerPage;

    chooseMaxContainer.appendChild(itemsPerPageDropdown);
    paginationContainer.appendChild(chooseMaxContainer);


    const paginationLinksContainer = document.createElement('div');
    paginationLinksContainer.className = 'pagination-links-container';

    for (let i = 1; i <= totalPages && i <= 10; i++) {
        const button = document.createElement('a');
        button.href = '#';
        button.textContent = i;
        button.className = 'page-link';
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => handlePageClick(i));
        paginationLinksContainer.appendChild(button);
    }

    paginationContainer.appendChild(paginationLinksContainer);

 
    const navigationContainer = document.createElement('div');
    navigationContainer.className = 'navigation-container';


    const newerButton = document.createElement('button');
    newerButton.innerHTML = 'Older <i class="bi bi-arrow-right"></i>';
    newerButton.className = 'btn btn-primary btn-sm';
    newerButton.addEventListener('click', () => handlePageClick(currentPage - 1));
    newerButton.disabled = currentPage === 1; 

    
    const olderButton = document.createElement('button');
    olderButton.innerHTML = '<i class="bi bi-arrow-left"></i> Newer'; 
    olderButton.className = 'btn btn-primary btn-sm';
    olderButton.addEventListener('click', () => handlePageClick(currentPage + 1));
    olderButton.disabled = currentPage === totalPages; 

    const BackButton = document.createElement('button');
    BackButton.innerHTML = 'Back'; 
    BackButton.className = 'btn btn-primary btn-sm';

    navigationContainer.appendChild(newerButton);
    navigationContainer.appendChild(olderButton);
    paginationContainer.appendChild(navigationContainer);
}

function handlePageClick(page) {
    currentPage = page;
    const buttons = document.querySelectorAll('.page-link');
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById('repositories').innerHTML = '';
    displayRepositories(allRepositories, page);

    const activeButton = document.querySelector(`.page-link:nth-child(${page})`);
    activeButton.classList.add('active');
}

function handleItemsPerPageChange(event) {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1; 
    displayRepositories(allRepositories, currentPage);
}

async function getUserDetails(username) {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error.response || error);
        return {};
    }
}

let lastFetchedRepositories;

getRepositories();

function goToTop() {
    window.scrollTo({
        top: document.getElementById('username').offsetTop,
        behavior: 'smooth'
    });
}
