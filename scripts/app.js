"use strict";

const DEFAULT_BASE_URL = "https://join-278b5-default-rtdb.europe-west1.firebasedatabase.app/";

window.JOIN_CONFIG = window.JOIN_CONFIG || {};
window.JOIN_CONFIG.BASE_URL = window.JOIN_CONFIG.BASE_URL || DEFAULT_BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
   const initials = document.getElementById("login__initials");
   const dropdown = document.getElementById("dropdownMenu");
   const logout = document.getElementById("dropdownLog");

   if (initials) {
      initials.textContent = "G";
      initials.addEventListener("click", () => dropdown?.classList.toggle("header__dropdown--opened"));
   }

   if (logout) {
      logout.addEventListener("click", () => dropdown?.classList.remove("header__dropdown--opened"));
   }

   document.addEventListener("click", (event) => {
      if (!event.target.closest("#login__initials") && !event.target.closest("#dropdownMenu")) {
         dropdown?.classList.remove("header__dropdown--opened");
      }
   });
});
