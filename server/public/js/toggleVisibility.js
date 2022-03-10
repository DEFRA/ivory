function toggleVisibility(elementIds) {
  elementIds.forEach(item => {
    let x = document.getElementById(item);
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  })
}
