const observerLeft = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }
    else{
      entry.target.classList.remove("show");
    }
  });
});

const hiddenElementsLeft = document.querySelectorAll(".hidden");
hiddenElementsLeft.forEach((el) => observerLeft.observe(el));

const observerRight = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if(entry.isIntersecting){
      entry.target.classList.add("showRight");
    }
    else{
      entry.target.classList.remove("showRight");
    }
  });
});

const hiddenElementsRight = document.querySelectorAll(".hiddenRight");
hiddenElementsRight.forEach((el) => observerRight.observe(el));