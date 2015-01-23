var ready = function (cb) {
  if (document.readyState != 'loading') {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', cb);
  }
};

var fadeAndRemove = function (element, cb) {
  var op = 1;  // initial opacity
  var timer = setInterval(function () {
    if (op <= 0.1){
      clearInterval(timer);
      element.remove();
    }
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= op * 0.3;
  }, 20);
}

if (navigator.userAgent.indexOf("MSIE ") !== -1) {
  alert('Internet Explorer may not support all features necessary to properly use this page. Please consider trying another browser.');
}

var validateForm = function() {
  document.getElementById('noQuestion').style.display = "none";
  document.getElementById('tooLow').style.display = "none";
  document.getElementById('isEmpty').style.display = "none";
  var doRet = true;
  if (document.querySelectorAll('.answer').length < 2) {
    document.getElementById('tooLow').style.display = "block";
    doRet = false;
  }
  var inputEls = document.querySelectorAll('input[name=\'answers\']');
  inputEls.forEach(function(inputEl) {
    if (!inputEl.value) {
      document.getElementById('isEmpty').style.display = "block";
      doRet = false;
    }
  });
  if (!document.querySelector('input[name=\'question\']').value) {
    document.getElementById('noQuestion').style.display = "block";
    doRet = false;
  }
  return doRet;
}

var readyPage = function() {
  NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;
  var i = 3;
  var sortEl = document.querySelector('.sortable');
  var sortable = Sortable.create(sortEl, {
    handle: '.drag-handle',
    animation: 150
  });
  var addEl = document.querySelector('.add');
  addEl.addEventListener('click', function () {
    var newInput = "<li class=\"answer\"><i class=\"ion-navicon-round drag-handle\"></i><input type=\"text\" name=\"answers\" tabindex=\"" + i + "\" placeholder=\"Answer\"><button type=\"button\" class=\"delete-answer\"><i class=\"ion-close-round\"></i></button></li>";
    i++;
    document.querySelector('.sortable').insertAdjacentHTML('beforeend', newInput);
    var closeEls = document.querySelectorAll('.delete-answer');
    closeEls.forEach(function(closeEl) {
      closeEl.addEventListener('click', function () {
        fadeAndRemove(this.parentNode);
      });
    });
  });
  var closeEls = document.querySelectorAll('.delete-answer');
  closeEls.forEach(function(closeEl) {
    closeEl.addEventListener('click', function () {
      fadeAndRemove(this.parentNode);
    });
  });
}

ready(readyPage);
