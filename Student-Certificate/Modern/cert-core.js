window.SVCert = {
  apiBase: "https://api.schoolvertex.com/api",

  getQueryParams: function () {
    var params = {};
    location.search
      .substr(1)
      .split("&")
      .forEach(function (item) {
        if (!item) return;
        var parts = item.split("=");
        var key = parts[0];
        var value = parts.slice(1).join("=");
        if (key) params[key] = decodeURIComponent(value || "");
      });
    return params;
  },

  convertDateToWords: function (dateString) {
    if (!dateString) return "";
    var date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    var months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var days = [
      "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh",
      "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth",
      "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth",
      "Nineteenth", "Twentieth", "Twenty-First", "Twenty-Second", "Twenty-Third",
      "Twenty-Fourth", "Twenty-Fifth", "Twenty-Sixth", "Twenty-Seventh",
      "Twenty-Eighth", "Twenty-Ninth", "Thirtieth", "Thirty-First"
    ];

    function getNumberWords(num) {
      var a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen", "Nineteen"
      ];
      var b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      if (num < 20) return a[num];
      if (num % 10 === 0) return b[num / 10];
      return b[Math.floor(num / 10)] + "-" + a[num % 10];
    }

    function yearWords(num) {
      if (num >= 2000 && num <= 2029) {
        return "Two Thousand " + getNumberWords(num - 2000);
      }
      var firstHalf = num.toString().substring(0, 2);
      var secondHalf = num.toString().substring(2);
      return getNumberWords(parseInt(firstHalf, 10)) + " " + getNumberWords(parseInt(secondHalf, 10));
    }

    return days[date.getDate() - 1] + " " + months[date.getMonth()] + ", " + yearWords(date.getFullYear());
  }
};
