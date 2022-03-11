function toggleVisibility(elementIds) {
  elementIds.forEach(item => {
    let x = document.getElementById(item);
    if (x.className === "govuk-!-display-none") {
      x.className = "govuk-!-display-block";
    } else {
      x.className = "govuk-!-display-none";
    }
  })
}
