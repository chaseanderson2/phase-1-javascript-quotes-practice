document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.getElementById("quote-list");
    const quoteForm = document.getElementById("new-quote-form");
    const sortButton = document.getElementById("sort-button");
  
    let sortActive = false;
  
    fetch("http://localhost:3000/quotes?_embed=likes")
      .then(response => response.json())
      .then(data => {
        data.forEach(quote => {
          renderQuote(quote);
        });
      })
      .catch(error => console.log(error));
  
    quoteForm.addEventListener("submit", event => {
      event.preventDefault();
      const newQuote = {
        quote: event.target.quote.value,
        author: event.target.author.value,
        likes: []
      };
  
      createQuote(newQuote)
        .then(quote => {
          renderQuote(quote);
          quoteForm.reset();
        })
        .catch(error => console.log(error));
    });
  
    function createQuote(quote) {
      return fetch("http://localhost:3000/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(quote)
      }).then(response => response.json());
    }
  
    function deleteQuote(quoteId) {
      return fetch(`http://localhost:3000/quotes/${quoteId}`, {
        method: "DELETE"
      }).then(response => response.json());
    }
  
    function likeQuote(quoteId, like) {
      return fetch(`http://localhost:3000/quotes/${quoteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(like)
      }).then(response => response.json());
    }
  
    function updateQuote(quoteId, quote) {
      return fetch(`http://localhost:3000/quotes/${quoteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(quote)
      }).then(response => response.json());
    }
  
    function fetchLikesCount(quoteId) {
      return fetch(`http://localhost:3000/likes?quoteId=${quoteId}`)
        .then(response => response.json())
        .then(likes => likes.length);
    }
  
    sortButton.addEventListener("click", toggleSort);
  
    function toggleSort() {
      sortActive = !sortActive;
      sortButton.textContent = sortActive ? "Sort by ID" : "Sort by Author";
      quoteList.innerHTML = "";
  
      fetch("http://localhost:3000/quotes?_embed=likes" + (sortActive ? "&_sort=author" : ""))
        .then(response => response.json())
        .then(data => {
          data.forEach(quote => {
            renderQuote(quote);
          });
        })
        .catch(error => console.log(error));
    }
  
    function renderQuote(quote) {
      const quoteItem = document.createElement("li");
      quoteItem.classList.add("quote-card");
  
      quoteItem.innerHTML = `
        <blockquote class="blockquote">
          <p class="mb-0">${quote.quote}</p>
          <footer class="blockquote-footer">${quote.author}</footer>
          <br>
          <button class="btn-success">Likes: <span>${quote.likes.length}</span></button>
          <button class="btn-danger">Delete</button>
          <button class="btn-edit">Edit</button>
        </blockquote>
      `;
  
      const deleteButton = quoteItem.querySelector(".btn-danger");
      deleteButton.addEventListener("click", () => {
        deleteQuote(quote.id)
          .then(() => {
            quoteItem.remove();
          })
          .catch(error => console.log(error));
      });
  
      const likeButton = quoteItem.querySelector(".btn-success");
      likeButton.addEventListener("click", () => {
        const userId = 1;
        const liked = quote.likes.find(like => like.userId === userId);
  
        if (liked) {
          const updatedLikes = quote.likes.filter(like => like.userId !== userId);
          likeQuote(quote.id, { likes: updatedLikes })
            .then(() => {
              likeButton.querySelector("span").textContent = updatedLikes.length;
            })
            .catch(error => console.log(error));
        } else {
          const updatedLikes = [...quote.likes, { userId }];
          likeQuote(quote.id, { likes: updatedLikes })
            .then(() => {
              likeButton.querySelector("span").textContent = updatedLikes.length;
            })
            .catch(error => console.log(error));
        }
      });
  
      const editButton = quoteItem.querySelector(".btn-edit");
      editButton.addEventListener("click", () => {
        const blockquote = quoteItem.querySelector("blockquote");
        const form = document.createElement("form");
        form.innerHTML = `
          <input type="text" name="quote" value="${quote.quote}" required>
          <input type="text" name="author" value="${quote.author}" required>
          <button type="submit">Update</button>
        `;
  
        form.addEventListener("submit", event => {
          event.preventDefault();
          const updatedQuote = {
            quote: event.target.quote.value,
            author: event.target.author.value
          };
  
          updateQuote(quote.id, updatedQuote)
            .then(() => {
              blockquote.innerHTML = `
                <p class="mb-0">${updatedQuote.quote}</p>
                <footer class="blockquote-footer">${updatedQuote.author}</footer>
                <br>
                <button class="btn-success">Likes: <span>${quote.likes.length}</span></button>
                <button class="btn-danger">Delete</button>
                <button class="btn-edit">Edit</button>
              `;
            })
            .catch(error => console.log(error));
        });
  
        blockquote.replaceWith(form);
      });
  
      fetchLikesCount(quote.id).then(likesCount => {
        likeButton.querySelector("span").textContent = likesCount;
      });
  
      quoteList.appendChild(quoteItem);
    }
  });