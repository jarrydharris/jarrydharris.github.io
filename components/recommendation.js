const recommendations = [
    {
        id: "recommendation-001",
        header: "Effective Machine Learning Teams",
        imgPath: "/images/effective_machine_learning_teams.png",
        imgAlt: "Effective Machine Learning Teams Book Cover",
        type: "Book",
        audience: "Anyone on a data science / ML team",
        why: "Excellent resource to understand common pitfalls in ML Delivery. Covers product thinking, delivery, engineering techniques, team dynamics, and culture.",
        href: "https://www.oreilly.com/library/view/effective-machine-learning/9781098144623/",
        linkText: "https://www.oreilly.com/"
    },
    {
        id: "recommendation-000",
        header: "The Pragmatic Programmer",
        imgPath: "/images/the_prag_prog_cover.png",
        imgAlt: "The Pragmatic Programmer Book Cover",
        type: "Book",
        audience: "Anyone whose job includes writing code.",
        why: "I can't imagine a better book to cover \"How to be good at your job\". Intended for software engineers but excellent read for data scientists as well.",
        href: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
        linkText: "https://pragprog.com"
    }
]

function renderRecommendations(data) {
    const container = document.querySelector('.recommendations-container');
    container.innerHTML = '';

    data.forEach(item => {
        const recommendationHTML = `
            <div id="${item.id}" class="recommendation">
                <div class="row">
                        <h4 class="recommendation__header">${item.header}</h4>
                </div>
                <div class="row">
                    <div class="six columns">
                        <img class="recommendation__img" src="${item.imgPath}" alt="${item.imgAlt}">
                    </div>
                    <div class="six columns">
                        <div class="recommendation__info">
                            <div class="recommendation__text recommendation__text--what"><b>Type: </b>${item.type}</div>
                            <div class="recommendation__text recommendation__text--who"><b>Audience: </b>${item.audience}</div>
                            <div class="recommendation__text recommendation__text--why"><b>Why: </b>${item.why}</div>
                            <div class="recommendation__text recommendation__text--where"><b>Link: </b><a href="${item.href}" target="_blank">${item.linkText}</a></div>
                        </div>
                    </div>
                </div>
            <hr>
            </div>
        `;
        container.innerHTML += recommendationHTML;
    });
}

renderRecommendations(recommendations);