function rate(reviewid, sentiment) {
  var requestConfig = {
    method: 'GET',
    url: `/reviews/${sentiment}/${reviewid}`,
    contentType: 'application/json',
  };

  $.ajax(requestConfig).then((res) => {
    if (res.error) {
      alert(res.error);
    } else {
      let review = $(`#review_${reviewid}`);
      let rating_elements = review.children()[0].children;

      if (sentiment == 'like') {
        rating_elements[0].classList.add('rating-active');
        rating_elements[2].classList.remove('rating-active');
      } else {
        rating_elements[2].classList.add('rating-active');
        rating_elements[0].classList.remove('rating-active');
      }
      rating_elements[1].innerText = res.review.likes - res.review.dislikes;
    }
  });
}

function like(reviewid) {
  rate(reviewid, 'like');
}

function dislike(reviewid) {
  rate(reviewid, 'dislike');
}

review_form = document.getElementById("new-review");
review_form_error = $("#new-review-error");

if (review_form) {
  review_form.addEventListener('submit', event => {
    review_form_error.hide();
    review_form_error.empty();

    let inputs = review_form.elements;
    let rating = parseInt(inputs[0].value);
    let body = inputs[1].value.trim();

    let error = false;
    if (inputs[0].value === '' || rating === NaN || rating < 1 || rating > 5) {
      error = true;
      review_form_error.append("<p>Rating must be an integer between 1 and 5.</p>");
    }
    if (body.length == 0) {
      error = true;
      review_form_error.append("<p>Review must not be empty.</p>");
    }

    if (error) {
      event.preventDefault();
      review_form_error.show();
      return false;
    }

    return true;
  });
}