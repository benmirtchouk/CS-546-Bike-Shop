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