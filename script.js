const API_URL = 'https://api.github.com/users/';
let currentPage = 1;
let perPage = 10;
let totalRepositories = 10;




function getRepositories() {
    const username =  $('#username').val();
    const reponame = $('#reponame').val().toLowerCase();

    if (!username) {
        alert('Please enter a GitHub username');
        return;
    }

    showLoader();

    $.ajax({
        url: `${API_URL}${username}`,
        method: 'GET',
        success: function (userData) {
            $(".userProfileWrapper").show()
            displayUserProfile(userData);
        },
        error: function (err) {
            console.log(err)
            alert('Error fetching user information. Please try again.');
        }
    });

    
    $.ajax({
        url: `${API_URL}${username}/repos`,
        method: 'GET',
        success: function (data) {
            totalRepositories=data.length;
            // console.log('urltotalupdate' + totalRepositories);
            if(!reponame){
                $.ajax({
                    url: `${API_URL}${username}/repos?page=${currentPage}&per_page=${perPage}`,
                    method: 'GET',
                    success: function (data) {
                        hideLoader();
                        displayRepositories(data);
                        $("#userDetailsWrapper").removeClass("userDetailsSection").addClass("userDetailsSection2");
                        updatePagination();
                    },
                    error: function () {
                        hideLoader();
                        alert('Error fetching repositories. Please try again.');
                    }
                });
            }
            else{
                data = data.filter(repo => repo.name.toLowerCase().includes(reponame));
                console.log(data);
                totalRepositories=data.length;
                let end = currentPage*perPage;
                data = data.slice(end-perPage,end);
                displayRepositories(data);
                updatePagination();
                hideLoader();

            }
        },
        error: function () {
            hideLoader();
        }
    });


}

function changePerPage() {
    perPage = parseInt($('#perPage').val(), 10);
    currentPage = 1;
    getRepositories();
}

function displayUserProfile(userData) {
    const userProfileContainer = $('#userProfile');
    
    userProfileContainer.empty();
    userProfileContainer.append(`
        <h2>${userData.login}</h2>
        <p>Bio: ${userData.bio || 'Not available'}</p>
        <p>Public Repositories: ${userData.public_repos}</p>
        <p>Followers: ${userData.followers}</p>
        <p>Following: ${userData.following}</p>
    `);
    $("#avatar-url").attr('src',userData.avatar_url);
}


function updatePagination() {
    const totalPages = Math.ceil(totalRepositories / perPage);
    // console.log('totalrep'+ totalRepositories);
    // console.log('perpage' + perPage);
    // console.log('totpage' + totalPages);
    const paginationContainer = $('#pagination');
    paginationContainer.empty();


    $('#currentPage').text(`Page ${currentPage} of ${totalPages}`);
    
    updatePageNavigation(totalPages);
}


function showLoader() {
    $('#loader').show();
    $('#repositories').empty();
}

function hideLoader() {
    $('#loader').hide();
}



function displayRepositories(repositories) {
    const repositoriesContainer = $('#repositories');
    repositoriesContainer.empty();
    repositories.forEach(async repository => {


        let repoData = $(`
        <div class="repository card">
        <h3 class='gitcardHeader'>${repository.name}</h3>
        <p class='gitProjectDes'>${repository.description || 'No description available'}</p>
        </div>
        `);

        const languageContain = $(`<div class="languageRow"></div>`);


        let languageData;

        await $.ajax({
            url: `${repository.languages_url}`,
            method: 'GET',
            success: function (data) {
                languageData = Object.keys(data);
                // console.log(data);
                // console.log(languageData);
    
                languageData.forEach(lang => {
                    languageContain.append(`<span class='projectLang'>${lang}</span>`);
                })
                repoData.append(languageContain);
    
                
    
    
            },
            error: function (err) {
                console.log(err)
                alert('Error fetching Repository Languages. Please try again.');
            }
        });

        let repo = $(`<div class='col-md-6'>
        </div>`);
        repo.append(repoData);

        repositoriesContainer.append(repo);
    });
}

function updatePageNavigation(totalPages) {
    const pageNavigationContainer = $('#pageNavigation');
    pageNavigationContainer.empty();

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    let pageMover = $(`<a href="#" class="gitNav-link"><</a>`);
    pageMover.click(function () {
        currentPage = currentPage-1;
        getRepositories();
    });

    pageNavigationContainer.append(pageMover);

    for (let i = startPage; i <= endPage; i++) {
        const pageLink = $(`<a href="#" class="gitNav-link">${i}</a>`);
        if (i === currentPage) {
            pageLink.addClass('active');
        }

        pageLink.click(function () {
            currentPage = i;
            getRepositories();
        });

        pageNavigationContainer.append(pageLink);
    }

    pageMover = $(`<a href="#" class="gitNav-link">></a>`);
    pageMover.click(function () {
        currentPage = currentPage+1;
        getRepositories();
    });

    pageNavigationContainer.append(pageMover);


}
$(function(){
    $('#submit-username').keydown(function(event){
        if(event.keyCode === 13){
            getRepositories();
        }
    })
   
})


// Initial load
$('#submit-username').click(function(event) {
    event.preventDefault();
    getRepositories()
})
