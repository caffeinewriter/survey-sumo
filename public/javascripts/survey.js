var ready = function (cb) {
  if (document.readyState != 'loading') {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', cb);
  }
};

var readyPage = function() {
  var i = 3;
  var sortEl = document.querySelector('.sortable');
  var sortable = Sortable.create(sortEl, {
    handle: '.ion-navicon-round',
    animation: 150
  });
  var addEl = document.querySelector('.add');
  addEl.addEventListener('click', function () {
    var newInput = "<li class=\"answer\"><span clsas=\"ion-close-round\"><input type=\"text\" name=\"answers\" placeholder=\"Answer\" /></li>";
    document.querySelector('.sortable').insertAdjacentHTML('beforeend', newInput);
  });
  var closeEl = document.querySelectorAll('.ion-close-round').addEventListener('click', function () {
    this.parentNode.removeChild(this.nextElementSibling);
    this.parentNode.removeChild(this);
  });
}

ready(readyPage);
