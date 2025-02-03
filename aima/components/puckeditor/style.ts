export const componentStyle = `

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}


/* Button */
.Button {
  appearance: none;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--puck-color-white);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.05ch;
  font-family: var(--puck-font-family);
  font-size: 14px;
  font-weight: 400;
  box-sizing: border-box;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  transition: background-color 50ms ease-in;
  cursor: pointer;
  margin: 0;
}

.Button:hover,
.Button:active {
  transition: none;
}

.Button--medium {
  min-height: 34px;
  padding-bottom: 7px;
  padding-left: 19px;
  padding-right: 19px;
  padding-top: 7px;
}

.Button--large {
  padding-bottom: 11px;
  padding-left: 19px;
  padding-right: 19px;
  padding-top: 11px;
}

.Button-icon {
  margin-top: 2px;
}

.Button--primary {
  background: var(--puck-color-azure-04);
}

.Button:focus-visible {
  outline: 2px solid var(--puck-color-azure-05);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .Button--primary:hover {
    background-color: var(--puck-color-azure-03);
  }
}

.Button--primary:active {
  background-color: var(--puck-color-azure-02);
}

.Button--secondary {
  border: 1px solid var(--puck-color-grey-01);
  color: var(--puck-color-black);
}

@media (hover: hover) and (pointer: fine) {
  .Button--secondary:hover {
    background-color: var(--puck-color-azure-12);
  }
}

.Button--secondary:active {
  background-color: var(--puck-color-azure-11);
}

.Button--flush {
  border-radius: 0;
}

.Button--disabled,
.Button--disabled:hover {
  background-color: var(--puck-color-grey-07);
  color: var(--puck-color-grey-03);
  cursor: not-allowed;
}

.Button--fullWidth {
  justify-content: center;
  width: 100%;
}

.Button-spinner {
  padding-left: 8px;
}

/* ButtonGroup */
.ButtonGroup-actions {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.ButtonGroup--center .ButtonGroup-actions {
  justify-content: center;
}

.ButtonGroup-button {
    text-decoration: none;
}

@media (max-width: 576px) {
    .ButtonGroup-button {
        width: 100% !important;
        font-size: 16px !important;
        padding: 15px 20px !important;
    }
}

/* Button */
.Button {
  display: block;
  text-align: center;
}

.Button-left {
  margin-right: auto;
}

.Button-center {
  margin: 0 auto;
}

.Button-right {
  margin-left: auto;
}

@media (max-width: 576px) {
  .Button {
    width: 100% !important;
    font-size: 16px !important;
    padding: 15px 20px !important;
  }
}

/* CardStyle */
.Card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  gap: 16px;
  width: 100%;
}

.Card--card {
  background: white;
  box-shadow: rgba(140, 152, 164, 0.25) 0px 3px 6px 0px;
  border-radius: 8px;
  flex: 1;
  max-width: 100%;
  margin-left: unset;
  margin-right: unset;
  padding: 24px;
  width: auto;
}

.Card-image {
  border-radius: 256px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30%;
}

.Card-title {
  font-size: 22px;
  text-align: center;
}

.Card--card .Card-title {
  text-align: left;
}

.Card-description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--puck-color-grey-05);
  text-align: center;
  font-weight: 300;
}

.Card--card .Card-description {
  text-align: left;
}

/* Columns */
.Columns {
  display: flex;
  gap: 24px;
  grid-template-columns: repeat(12, 1fr);
  flex-direction: column;
  min-height: 0; /* NEW */
  min-width: 0; /* NEW; needed for Firefox */
}

@media (min-width: 768px) {
  .Columns {
    display: grid;
  }
}

/* FeatureList */
.FeatureList-items {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.FeatureList--cardMode .FeatureList-items {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .FeatureList--cardMode .FeatureList-items {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.FeatureList-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 312px;
  margin-left: auto;
  margin-right: auto;
  gap: 16px;
  width: 100%;
}

.FeatureList--cardMode .FeatureList-item {
  background: white;
  box-shadow: rgba(140, 152, 164, 0.25) 0px 3px 6px 0px;
  border-radius: 8px;
  max-width: 100%;
  margin-left: unset;
  margin-right: unset;
  padding: 24px;
  align-items: flex-start;
  width: auto;
}

.FeatureList-icon {
  border-radius: 256px;
  background: var(--puck-color-azure-09);
  color: var(--puck-color-azure-06);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
}

.FeatureList-title {
  font-size: 22px;
  text-align: center;
}

.FeatureList--cardMode .FeatureList-title {
  text-align: left;
}

.FeatureList-description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--puck-color-grey-05);
  text-align: center;
  font-weight: 300;
}

.FeatureList--cardMode .FeatureList-description {
  text-align: left;
}

/* Header */
.Header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px 10px 0px 10px;
  background-repeat: repeat;
  background-position: left top;
  background-attachment: scroll;
  background-size: auto;
  line-height: normal;
}

@media (min-width: 768px) {
  .Header {
    padding: 16px 24px;
  }
}

.Header-logo {
  max-width: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.Header-logo img {
  width: 100px;
  height: 100px;
}

.Header-title {
  font-family: Verdana, Geneva, sans-serif;
  width: 100%;
  display: block;
  padding: 10px 0px 0px 0px;
  background-repeat: repeat;
  background-position: left top;
  background-attachment: scroll;
  background-size: auto;
}

@media (min-width: 1024px) {
  .Header-items {
    font-size: 16px;
  }
}

/* Typography */
@media (max-width: 768px) {
  .Typography {
    width: fit-content !important;
  }
}

@media (max-width: 576px) {
  .Typography {
    width: 100% !important;
  }
}

/* Headline */
.Headline {
  display: block;
  line-height: normal;
}

@media (max-width: 768px) {
  .Headline {
    font-size: 30px !important;
    padding: 10px 20px !important;
  }
}

@media (max-width: 576px) {
  .Headline {
    font-size: 28px !important;
    padding: 15px 10px !important;
  }
}

/* Subtitle */
.Subtitle {
  display: block;
  line-height: normal;
}

@media (max-width: 768px) {
  .Subtitle {
    font-size: 22px !important;
    padding: 10px 20px !important;
  }
}

@media (max-width: 576px) {
  .Subtitle {
    font-size: 20px !important;
    padding: 10px !important;
  }
}

/* Footer */
.Footer {
  display: flex;
  padding: 20px 10px 20px 10px;
  justify-content: center;
  align-items: center;
}

.Footer-row {
  max-width: 80%;
  min-height: 75px;
  flex-grow: 1;
  flex-basis: 100%;
}

.Footer-cell {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: nowrap;
  padding: 10px;
}

.Footer-logo {
  padding: 10px 10px 10px 10px;
  margin: 10px 10px 10px 10px;
  min-height: 75px;
  flex-grow: 1;
  flex-basis: 100%;
}

.Footer-logo img {
  width: 130px;
  height: 130px;
}

.Footer-info {
  padding: 10px 10px 10px 10px;
  margin: 10px 10px 10px 10px;
  min-height: 75px;
  flex-grow: 1;
  flex-basis: 100%;
}

.Footer-subtitle {
  width: 100%;
  font-size: 12px;
  padding-top: 10px;
  padding-bottom: 10px;
  text-align: center;
  font-family: Verdana, Geneva, sans-serif;
  margin: 10px 0 0px 0;
}
.Footer-subtitle2 {
  width: 100%;
  font-size: 12px;
  padding-top: 10px;
  padding-bottom: 10px;
  text-align: center;
  font-family: Verdana, Geneva, sans-serif;
  margin: 0px 0 10px 0;
}

.Footer-paragraph {
  width: 100%;
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  text-align: center;
  font-family: Verdana, Geneva, sans-serif;
}

/* Hero */
.Hero {
  background-image: linear-gradient(
    rgba(255, 255, 255, 0),
    rgb(247, 250, 255) 100%
  );
  display: flex;
  align-items: center;
  position: relative;
}

.Hero-inner {
  display: flex;
  align-items: center;
  position: relative;
  gap: 48px;
  flex-wrap: wrap;
  z-index: 1;
}

@media (min-width: 1024px) {
  .Hero-inner {
    flex-wrap: nowrap;
  }
}

.Hero h1 {
  line-height: 1.1;
  font-size: 48px;
  margin: 0;
}

@media (min-width: 768px) {
  .Hero h1 {
    font-size: 64px;
  }
}

.Hero-subtitle {
  color: var(--puck-color-grey-05);
  font-size: var(--puck-font-size-m);
  line-height: 1.5;
  margin: 0;
  margin-bottom: 8px;
  font-weight: 300;
}

.Hero-subtitle-white {
  color: #ffffff;
  font-size: var(--puck-font-size-m);
  line-height: 1.5;
  margin: 0;
  margin-bottom: 8px;
  font-weight: 300;
}

.Hero--hasImageBackground .Hero-subtitle {
  color: var(--puck-color-grey-03);
}

.Hero-image {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
}

.Hero-imageOverlay {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  opacity: 0.3;
}

.Hero-bg img {
  height: 100%;
}

.Hero-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.Hero-white {
  color: #ffffff;
}

@media (min-width: 768px) {
  .Hero--hasImageBackground .Hero-content {
    max-width: 50%;
  }
}

.Hero--center .Hero-inner {
  justify-content: center;
  text-align: center;
}

.Hero--center .Hero-content {
  align-items: center;
  justify-content: center;
  max-width: 100%;
}

.Hero-actions {
  display: flex;
  gap: 16px;
}

/* Logos */
.Logos {
  background-color: var(--puck-color-grey-02);
}

.Logos-items {
  display: flex;
  justify-content: space-between;
  padding-bottom: 64px;
  padding-top: 64px;
  gap: 24px;
  filter: grayscale(1) brightness(100);
  opacity: 0.8;
}

/* Section */
.Section:not(.Section .Section) {
  padding-left: 16px;
  padding-right: 16px;
  color: #000000;
}

@media (min-width: 768px) {
  .Section:not(.Section .Section) {
    padding-left: 24px;
    padding-right: 24px;
  }
}

.Section:not(.Section .Section) .Section-inner {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

/* Stats */
.Stats-items {
  background-image: linear-gradient(
    120deg,
    var(--puck-color-azure-03) 0%,
    var(--puck-color-azure-05) 100%
  );
  border-radius: 24px;
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 72px;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 768px;
  padding: 64px 16px;
}

@media (min-width: 768px) {
  .Stats-items {
    padding: 64px 24px;
  }
}

@media (min-width: 1024px) {
  .Stats-items {
    grid-template-columns: 1fr 1fr;
    padding: 128px 24px;
    max-width: 100%;
  }
}

.Stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  gap: 8px;
  width: 100%;
}

.Stats-icon {
  border-radius: 256px;
  background: var(--puck-color-azure-09);
  color: var(--puck-color-azure-06);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
}

.Stats-label {
  text-align: center;
  opacity: 0.8;
}

.Stats-value {
  line-height: 1;
}

/* Text */
.Text {
  line-height: 1.5;
  padding: 0px;
}

@media (max-width: 576px) {
    .Text {
        font-size: 18px !important;
    }
}

/* Headline */
.Headline {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  display: inline-block;
}

/* Subtitle */
.Subtitle {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  display: inline-block;
}

/* Image */
.Image {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  max-width: 100%;
  object-fit: contain;
}

.Image-left {
  margin-right: auto;
}

.Image-center {
  margin: 0 auto;
}

.Image-right {
  margin-left: auto;
}

/* Video */
.Video {
  display: block;
  border: none;
  outline: none;
}

.Video-left {
  margin-right: auto;
}

.Video-center {
  margin: 0 auto;
}

.Video-right {
  margin-left: auto;
}

@media (max-width: 576px) {
  .Video {
    width: 100% !important;
  }
}

/* Layout */
.Layout-image {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
}

.Layout-FullWidth {
  width: 100%;
  max-width: 100%;
  min-height: 10px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.Layout-Wide {
  width: 1200px;
  max-width: 100%;
  min-height: 10px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.Layout-Medium {
  width: 800px;
  max-width: 100%;
  min-height: 10px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.Layout-Small  {
  width: 600px;
  max-width: 100%;
  min-height: 10px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

@media (max-width: 1240px) {
  .Layout-Wide {
    width: 800px;
  }
}

@media (max-width: 840px) {
  .Layout-Wide {
    width: 600px;
  }

  .Layout-Medium {
    width: 600px;
  }
}

@media (max-width: 640px) {
  .Layout-Wide  {
    width: calc(100% - 40px);
  }

  .Layout-Medium  {
    width: calc(100% - 40px);
  }

  .Layout-Small  {
    width: calc(100% - 40px);
  }
}

/* Menu */
.Menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.Menu ul {
  /* Make the markers disappear */
  list-style-type: none;
}

.Menu ul li {
  /* Puts the elements in a single line */
  display: inline-flex;
  margin: 0.3em 1em;
}

.Menu ul li a {
    text-decoration: none;
}

/* These two lines make the checkbox and the label disappear when we are in desktop mode. */
.Menu input[type="checkbox"],
.Menu label {
  display: none;
}

/* This start to get interesting: we go into mobile phone mode */
@media (max-width: 576px) {
  /* Here is the magic: if the checkbox is not marked, the adjacent list is not displayed */
  input[type="checkbox"]:not(:checked) + ul {
    display: none;
  }

  .Menu {
    flex-direction: row;
    flex-wrap: wrap;
    margin-left: 0;
    margin-right: 0;
  }

  /* Stlying the menu icon, the checkbox stays hidden */
  .Menu label {
    text-align: right;
    display: block;
    padding: 0.5em;
    line-height: 1.6em;
    align-self: center;
  }

  /* Because we are in mobile mode, we want to display it as a vertical list */
  .Menu ul {
    display: block;
  }

  /* We have two lists: the first one are the always visibile items in the 
    menu bar. The second one is the one that will be hidden */
  .Menu ul:last-child {
    width: 100%;
    flex-basis: 100%;
    padding: 0;
    text-align: center;
  }

  .Menu ul li {
    display: flex;
    justify-content: center;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    text-align: right;
    padding: 0.5em;
  }
}

/* EmailForm */
.EmailForm {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.EmailForm-title-left {
  margin-right: auto;
}

.EmailForm-title-center {
  margin: 0 auto;
}

.EmailForm-title-right {
  margin-left: auto;
}

.EmailForm-input {
  margin-top: 16px;
  width: 100%;
  border-radius: 6px;
  border: 1px solid rgb(224, 230, 237);
  background-color: #FFFFFF;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: rgb(14, 23, 38);
  outline: 2px solid transparent;
  outline-offset: 2px;
  padding: 8px 16px;
}

.EmailForm-button {
  cursor: pointer;
}

@media (max-width: 767px) {
  .EmailForm {
    width: 100% !important;
  }
}

@media (max-width: 576px) {
  .EmailForm-button {
    font-size: 16px !important;
    padding: 15px 20px !important;
  }
}

/* Accordion */
.Accordion {
    width: 100%;
    margin-top: 15px;
    box-shadow: 6px 6px 10px -1px rgba(0, 0, 0, 0.15), -6px -6px 10px -1px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
    overflow: hidden;
}

.Accordion-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.Accordion-label::before {
    content: "+";
    margin-right: 10px;
    font-size: 24px;
    font-weight: 600;
}

.Accordion-input {
    display: none;
}

.Accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s, padding 0.5s;
}

.Accordion-input:checked + label + .Accordion-content {
    max-height: 400px;
}

.Accordion-input:checked + label::before {
    content: "-";
}

/* GoogleMaps */
.GoogleMap {
    display: block;
}

.GoogleMap-map {
    border: none !important;
}

@media (max-width: 576px) {
  .GoogleMap {
    padding: 0 !important;
  }

  .GoogleMap-map {
     width: 100% !important;
  }
}

/* URL */
.URL {
    display: flex;
}

.URL-left {
    justify-content: flex-start;
}

.URL-center {
    justify-content: center;
}

.URL-right {
    justify-content: flex-end;
}

/* Toast */
.toast {
  position: fixed;
  top: 30px;
  right: 20px;
  width: 400px;
  overflow: hidden;
  border-radius: 4px;
  padding: 16px 17px;
  margin-bottom: 10px;
  color: #ffffff;
  font-weight: 600;
  justify-content: space-between;
  animation: show_toast 0.3s ease forwards;
}

.toast-success {
    background: #0abf30;
}

.toast-error {
    background: #e24d4c;
}

@keyframes show_toast {
  0% {
    transform: translateX(100%);
  }
  40% {
    transform: translateX(-5%);
  }
  80% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-10px);
  }
}

.toast.hide {
  animation: hide_toast 0.3s ease forwards;
}

@keyframes hide_toast {
  0% {
    transform: translateX(-10px);
  }
  40% {
    transform: translateX(0%);
  }
  80% {
    transform: translateX(-5%);
  }
  100% {
    transform: translateX(calc(100% + 20px));
  }
}

.toast::before {
  position: absolute;
  content: "";
  height: 3px;
  width: 100%;
  bottom: 0px;
  left: 0px;
  animation: progress 5s linear forwards;
}

@keyframes progress {
  100% {
    width: 0%;
  }
}

.toast.success::before {
  background: #0abf30;
}


`;

export const puckStyle = `
:root {
  /*
    * Color palette
    */
 
   --puck-color-rose-01: #4a001c;
   --puck-color-rose-02: #670833;
   --puck-color-rose-03: #87114c;
   --puck-color-rose-04: #a81a66;
   --puck-color-rose-05: #bc5089;
   --puck-color-rose-06: #cc7ca5;
   --puck-color-rose-07: #d89aba;
   --puck-color-rose-08: #e3b8cf;
   --puck-color-rose-09: #efd6e3;
   --puck-color-rose-10: #f6eaf1;
   --puck-color-rose-11: #faf4f8;
   --puck-color-rose-12: #fef8fc;
 
   --puck-color-azure-01: #00175d;
   --puck-color-azure-02: #002c77;
   --puck-color-azure-03: #014292;
   --puck-color-azure-04: #0158ad;
   --puck-color-azure-05: #3479be;
   --puck-color-azure-06: #6499cf;
   --puck-color-azure-07: #88b0da;
   --puck-color-azure-08: #abc7e5;
   --puck-color-azure-09: #cfdff0;
   --puck-color-azure-10: #e7eef7;
   --puck-color-azure-11: #f3f6fb;
   --puck-color-azure-12: #f7faff;
 
   --puck-color-green-01: #002000;
   --puck-color-green-02: #043604;
   --puck-color-green-03: #084e08;
   --puck-color-green-04: #0c680c;
   --puck-color-green-05: #1d882f;
   --puck-color-green-06: #2faa53;
   --puck-color-green-07: #56c16f;
   --puck-color-green-08: #7dd78b;
   --puck-color-green-09: #b8e8bf;
   --puck-color-green-10: #ddf3e0;
   --puck-color-green-11: #eff8f0;
   --puck-color-green-12: #f3fcf4;
 
   --puck-color-yellow-01: #211000;
   --puck-color-yellow-02: #362700;
   --puck-color-yellow-03: #4c4000;
   --puck-color-yellow-04: #645a00;
   --puck-color-yellow-05: #877614;
   --puck-color-yellow-06: #ab9429;
   --puck-color-yellow-07: #bfac4e;
   --puck-color-yellow-08: #d4c474;
   --puck-color-yellow-09: #e6deb1;
   --puck-color-yellow-10: #f3efd9;
   --puck-color-yellow-11: #f9f7ed;
   --puck-color-yellow-12: #fcfaf0;
 
   --puck-color-red-01: #4c0000;
   --puck-color-red-02: #6a0a10;
   --puck-color-red-03: #8a1422;
   --puck-color-red-04: #ac1f35;
   --puck-color-red-05: #bf5366;
   --puck-color-red-06: #ce7e8e;
   --puck-color-red-07: #d99ca8;
   --puck-color-red-08: #e4b9c2;
   --puck-color-red-09: #efd7db;
   --puck-color-red-10: #f6eaec;
   --puck-color-red-11: #faf4f5;
   --puck-color-red-12: #fff9fa;
 
   --puck-color-grey-01: #181818;
   --puck-color-grey-02: #292929;
   --puck-color-grey-03: #404040;
   --puck-color-grey-04: #5a5a5a;
   --puck-color-grey-05: #767676;
   --puck-color-grey-06: #949494;
   --puck-color-grey-07: #ababab;
   --puck-color-grey-08: #c3c3c3;
   --puck-color-grey-09: #dcdcdc;
   --puck-color-grey-10: #efefef;
   --puck-color-grey-11: #f5f5f5;
   --puck-color-grey-12: #fafafa;
 
   --puck-color-black: #000000;
   --puck-color-white: #ffffff;
 }
 
 #puck-preview {
   color: #000000;
   background-color: #ffffff;
 }
 
/* styles/color.css */

body {
  margin: 0;
}

:root {
  --puck-color-neutral-0: #fafafa;
  --puck-color-neutral-1: #f3f3f3;
  --puck-color-neutral-2: #e7e5e5;
  --puck-color-neutral-3: #9e9e9e;
  --puck-color-neutral-4: #2d2d2d;
  --puck-color-neutral-blue: #10131c;
  --puck-color-blue: var(--puck-color-azure-3);
  --puck-color-rose: var(--puck-color-rose-3);
  --puck-color-red: var(--puck-color-red-3);
  --puck-color-rose-0: #4a001c;
  --puck-color-rose-1: #670833;
  --puck-color-rose-2: #87114c;
  --puck-color-rose-3: #a81a66;
  --puck-color-rose-4: #bc5089;
  --puck-color-rose-5: #cc7ca5;
  --puck-color-rose-6: #d89aba;
  --puck-color-rose-7: #e3b8cf;
  --puck-color-rose-8: #efd6e3;
  --puck-color-rose-9: #faf4f8;
  --puck-color-azure-0: #00175d;
  --puck-color-azure-1: #002c77;
  --puck-color-azure-2: #014292;
  --puck-color-azure-3: #0158ad;
  --puck-color-azure-4: #3479be;
  --puck-color-azure-5: #6499cf;
  --puck-color-azure-6: #88b0da;
  --puck-color-azure-7: #abc7e5;
  --puck-color-azure-8: #cfdff0;
  --puck-color-azure-85: #e1eaf6;
  --puck-color-azure-9: #f3f6fb;
  --puck-color-green-0: #002000;
  --puck-color-green-1: #043604;
  --puck-color-green-2: #084e08;
  --puck-color-green-3: #0c680c;
  --puck-color-green-4: #1d882f;
  --puck-color-green-5: #2faa53;
  --puck-color-green-6: #56c16f;
  --puck-color-green-7: #7dd78b;
  --puck-color-green-8: #b8e8bf;
  --puck-color-green-9: #eff8f0;
  --puck-color-yellow-0: #211000;
  --puck-color-yellow-1: #362700;
  --puck-color-yellow-2: #4c4000;
  --puck-color-yellow-3: #645a00;
  --puck-color-yellow-4: #877614;
  --puck-color-yellow-5: #ab9429;
  --puck-color-yellow-6: #bfac4e;
  --puck-color-yellow-7: #d4c474;
  --puck-color-yellow-8: #e6deb1;
  --puck-color-yellow-9: #f9f7ed;
  --puck-color-red-0: #4c0000;
  --puck-color-red-1: #6a0a10;
  --puck-color-red-2: #8a1422;
  --puck-color-red-3: #ac1f35;
  --puck-color-red-4: #bf5366;
  --puck-color-red-5: #ce7e8e;
  --puck-color-red-6: #d99ca8;
  --puck-color-red-7: #e4b9c2;
  --puck-color-red-8: #efd7db;
  --puck-color-red-9: #faf4f5;
  --puck-color-grey-0: #111111;
  --puck-color-grey-1: #282828;
  --puck-color-grey-2: #404040;
  --puck-color-grey-3: #5a5a5a;
  --puck-color-grey-4: #767676;
  --puck-color-grey-5: #949494;
  --puck-color-grey-6: #ababab;
  --puck-color-grey-7: #c3c3c3;
  --puck-color-grey-8: #dcdcdc;
  --puck-color-grey-9: #efefef;
  --puck-color-grey-10: #f5f5f5;
  --puck-color-grey-11: #fafafa;
  --puck-color-black: #000000;
  --puck-color-white: #ffffff;
}

/* styles/typography.css */
:root {
  --puck-font-size-scale-base-unitless: 12;
  --puck-font-size-xxxs-unitless: 12;
  --puck-font-size-xxs-unitless: 14;
  --puck-font-size-xs-unitless: 16;
  --puck-font-size-s-unitless: 18;
  --puck-font-size-m-unitless: 21;
  --puck-font-size-l-unitless: 24;
  --puck-font-size-xl-unitless: 28;
  --puck-font-size-xxl-unitless: 36;
  --puck-font-size-xxxl-unitless: 48;
  --puck-font-size-xxxxl-unitless: 56;
  --puck-font-size-xxxs: calc(1rem * var(--puck-font-size-xxxs-unitless) / 16);
  --puck-font-size-xxs: calc(1rem * var(--puck-font-size-xxs-unitless) / 16);
  --puck-font-size-xs: calc(1rem * var(--puck-font-size-xs-unitless) / 16);
  --puck-font-size-s: calc(1rem * var(--puck-font-size-s-unitless) / 16);
  --puck-font-size-m: calc(1rem * var(--puck-font-size-m-unitless) / 16);
  --puck-font-size-l: calc(1rem * var(--puck-font-size-l-unitless) / 16);
  --puck-font-size-xl: calc(1rem * var(--puck-font-size-xl-unitless) / 16);
  --puck-font-size-xxl: calc(1rem * var(--puck-font-size-xxl-unitless) / 16);
  --puck-font-size-xxxl: calc(1rem * var(--puck-font-size-xxxl-unitless) / 16);
  --puck-font-size-xxxxl: calc( 1rem * var(--puck-font-size-xxxxl-unitless) / 16 );
  --puck-font-size-base: var(--puck-font-size-xs);
  --line-height-reset: 1;
  --line-height-xs: calc( var(--space-m-unitless) / var(--puck-font-size-m-unitless) );
  --line-height-s: calc( var(--space-m-unitless) / var(--puck-font-size-s-unitless) );
  --line-height-m: calc( var(--space-m-unitless) / var(--puck-font-size-xs-unitless) );
  --line-height-l: calc( var(--space-m-unitless) / var(--puck-font-size-xxs-unitless) );
  --line-height-xl: calc( var(--space-m-unitless) / var(--puck-font-size-scale-base-unitless) );
  --line-height-base: var(--line-height-m);
  --puck-font-stack:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Helvetica Neue,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol;
  --puck-font-stack-variable:
    "Inter var",
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Helvetica Neue,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol;
  --puck-font-family-monospaced:
    ui-monospace,
    "Cascadia Code",
    "Source Code Pro",
    Menlo,
    Consolas,
    "DejaVu Sans Mono",
    monospace;
  --puck-font-family-proportional: var(--puck-font-stack), sans-serif;
}

/* styles/global.css */

/* css-module:/home/runner/work/puck/puck/packages/core/components/Button/Button.module.css/#css-module-data */
._Button_1brfa_1 {
  appearance: none;
  background: none;
  border: none;
  border-radius: 4px;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.05ch;
  font-family: var(--puck-font-family-proportional);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  margin: 0;
}
._Button--medium_1brfa_22 {
  padding-bottom: 8px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 8px;
}
._Button--large_1brfa_29 {
  padding-bottom: 12px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 12px;
}
._Button-icon_1brfa_36 {
  margin-top: 2px;
}
._Button_1brfa_1:hover {
  text-decoration: none;
}
._Button--primary_1brfa_44 {
  background: var(--puck-color-blue);
}
._Button--primary_1brfa_44:hover {
  opacity: 0.7;
  transition: opacity 50ms ease-in;
}
._Button--secondary_1brfa_53 {
  color: currentColor;
  border: 1px solid currentColor;
}
._Button--secondary_1brfa_53:hover {
  background-color: var(--puck-color-grey-10);
  color: black;
  opacity: 0.7;
}
._Button--flush_1brfa_64 {
  border-radius: 0;
}
._Button--disabled_1brfa_68 {
  background: var(--puck-color-grey-10);
  color: black;
  cursor: not-allowed;
}
._Button--disabled_1brfa_68:hover {
  opacity: 1;
}
._Button--fullWidth_1brfa_78 {
  width: 100%;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Drawer/styles.module.css/#css-module-data */
._DrawerItem_1qydx_1:last-of-type ._DrawerItem-default_1qydx_1 ._DrawerItem-draggableWrapper_1qydx_1 {
  padding-bottom: 0px;
}
._DrawerItem-default_1qydx_1 ._DrawerItem-draggableWrapper_1qydx_1 {
  padding-bottom: 12px;
}
._DrawerItem-draggable_1qydx_1 {
  background: white;
  padding: 12px;
  display: flex;
  border: 1px var(--puck-color-grey-8) solid;
  border-radius: 4px;
  font-size: var(--puck-font-size-xxs);
  justify-content: space-between;
  align-items: center;
  cursor: grab;
}
._Drawer_1qydx_1:not(._Drawer--isDraggingFrom_1qydx_21) ._DrawerItem-draggable_1qydx_1:hover {
  background-color: var(--puck-color-azure-9);
  color: var(--puck-color-azure-4);
}
._DrawerItem-name_1qydx_26 {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DragIcon/styles.module.css/#css-module-data */
._DragIcon_o29on_1 {
  color: var(--puck-color-grey-4);
  padding: 4px;
  border-radius: 4px;
}
._DragIcon_o29on_1:hover {
  cursor: grab;
  background: var(--puck-color-grey-9);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DraggableComponent/styles.module.css/#css-module-data */
._DraggableComponent_foluk_1 {
  outline-offset: 0px !important;
  pointer-events: auto;
}
._DraggableComponent--isDragging_foluk_6 {
  background: #abc7e510;
  outline: 2px var(--puck-color-azure-8) solid !important;
  overflow: hidden;
}
._DraggableComponent-contents_foluk_12 {
  position: relative;
  pointer-events: none;
  z-index: 0;
}
._DraggableComponent-contents_foluk_12::before,
._DraggableComponent-contents_foluk_12::after {
  content: " ";
  display: table;
}
._DraggableComponent-overlay_foluk_25 {
  display: none;
  background: #abc7e530;
  cursor: pointer;
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 0;
  font-family: var(--puck-font-stack);
  pointer-events: none;
  box-sizing: border-box;
}
._DraggableComponent-loadingOverlay_foluk_39 {
  background: var(--puck-color-white);
  color: var(--puck-color-grey-2);
  border-radius: 4px;
  display: flex;
  padding: 8px;
  top: 8px;
  right: 8px;
  position: absolute;
  z-index: 1;
  pointer-events: all;
  box-sizing: border-box;
  opacity: 0.8;
  z-index: 1;
}
._DraggableComponent_foluk_1:hover:not(._DraggableComponent--isLocked_foluk_55) > ._DraggableComponent-overlay_foluk_25 {
  display: block;
  pointer-events: none;
}
._DraggableComponent--forceHover_foluk_61 > ._DraggableComponent-overlay_foluk_25 {
  display: block;
  pointer-events: none;
}
._DraggableComponent_foluk_1:not(._DraggableComponent--isSelected_foluk_66) > ._DraggableComponent-overlay_foluk_25 {
  outline: 2px var(--puck-color-azure-8) solid !important;
}
._DraggableComponent--indicativeHover_foluk_71 > ._DraggableComponent-overlay_foluk_25 {
  display: block;
  background: transparent;
  pointer-events: none;
}
._DraggableComponent_foluk_1:not(._DraggableComponent--isSelected_foluk_66):has(._DraggableComponent_foluk_1:hover > ._DraggableComponent-overlay_foluk_25) > ._DraggableComponent-overlay_foluk_25 {
  display: none;
}
._DraggableComponent--isSelected_foluk_66 {
  outline: 2px var(--puck-color-azure-6) solid !important;
}
._DraggableComponent--isSelected_foluk_66 > ._DraggableComponent-overlay_foluk_25 {
  background: none;
  display: block;
  position: sticky;
  top: 56px;
  z-index: 1;
}
._DraggableComponent-actions_foluk_97 {
  position: absolute;
  right: 6.5px;
  width: auto;
  top: -48px;
  padding: 4px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-radius: 8px;
  background: var(--puck-color-grey-0);
  color: white;
  display: none;
  gap: 4px;
  pointer-events: auto;
  box-sizing: border-box;
}
._DraggableComponent--isSelected_foluk_66 > ._DraggableComponent-overlay_foluk_25 > ._DraggableComponent-actions_foluk_97 {
  display: flex;
}
._DraggableComponent-actionsLabel_foluk_120 {
  color: var(--puck-color-grey-7);
  display: flex;
  font-size: var(--puck-font-size-xxxs);
  font-weight: 500;
  justify-content: center;
  align-items: center;
  padding-left: 8px;
  padding-right: 16px;
  margin-right: 8px;
  border-right: 1px solid var(--puck-color-grey-4);
  text-overflow: ellipsis;
  white-space: nowrap;
}
._DraggableComponent-action_foluk_97 {
  background: transparent;
  border: none;
  color: var(--puck-color-grey-7);
  padding: 6px 8px;
  border-radius: 4px;
  overflow: hidden;
}
._DraggableComponent-action_foluk_97:hover {
  background: var(--puck-color-grey-2);
  color: var(--puck-color-azure-5);
  cursor: pointer;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DropZone/styles.module.css/#css-module-data */
._DropZone_i675d_1 {
  margin-left: auto;
  margin-right: auto;
  position: relative;
  height: 100%;
  outline-offset: -1px;
  width: 100%;
}
._DropZone--zoomEnabled_i675d_10 {
  zoom: 1.33;
}
._DropZone--zoomEnabled_i675d_10 ._DropZone-renderWrapper_i675d_14 {
  zoom: 0.75;
}
._DropZone-content_i675d_18 {
  min-height: 64px;
  height: 100%;
}
._DropZone--userIsDragging_i675d_23 ._DropZone-content_i675d_18 {
  pointer-events: all;
}
._DropZone--userIsDragging_i675d_23:not(._DropZone--draggingOverArea_i675d_27):not(._DropZone--draggingNewComponent_i675d_28) > ._DropZone-content_i675d_18 {
  pointer-events: none;
}
._DropZone--isAreaSelected_i675d_34,
._DropZone--draggingOverArea_i675d_27:not(:has(._DropZone--hoveringOverArea_i675d_35)),
._DropZone--hoveringOverArea_i675d_35:not(._DropZone--isDisabled_i675d_36):not(._DropZone--isRootZone_i675d_37) {
  background: var(--puck-color-azure-9);
  outline: 2px dashed var(--puck-color-azure-7);
}
._DropZone_i675d_1:not(._DropZone--hasChildren_i675d_43) {
  background: var(--puck-color-azure-9);
  outline: 2px dashed var(--puck-color-azure-7);
}
._DropZone--isDestination_i675d_48 {
  outline: 2px dashed var(--puck-color-azure-3) !important;
}
._DropZone--isDestination_i675d_48:not(._DropZone--isRootZone_i675d_37) {
  background: var(--puck-color-azure-85) !important;
}
._DropZone-item_i675d_56 {
  position: relative;
}
._DropZone-hitbox_i675d_60 {
  position: absolute;
  bottom: -12px;
  height: 24px;
  width: 100%;
  z-index: 1;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/IconButton/IconButton.module.css/#css-module-data */
._IconButton_38xdr_1 {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: currentColor;
  display: flex;
  justify-content: center;
  padding: 4px;
}
._IconButton_38xdr_1:hover {
  background: var(--puck-color-grey-9);
  color: var(--puck-color-blue);
  cursor: pointer;
}
._IconButton-title_38xdr_18 {
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/SidebarSection/styles.module.css/#css-module-data */
._SidebarSection_170gs_1 {
  display: flex;
  position: relative;
  flex-direction: column;
  color: black;
}
._SidebarSection_170gs_1:last-of-type {
  flex-grow: 1;
}
._SidebarSection-title_170gs_12 {
  background: white;
  padding: 16px;
  border-bottom: 1px solid var(--puck-color-grey-8);
  border-top: 1px solid var(--puck-color-grey-8);
  overflow-x: auto;
}
._SidebarSection--noBorderTop_170gs_20 > ._SidebarSection-title_170gs_12 {
  border-top: 0px;
}
._SidebarSection-content_170gs_24 {
  padding: 16px;
}
._SidebarSection--noPadding_170gs_28 > ._SidebarSection-content_170gs_24 {
  padding: 0px;
}
._SidebarSection--noPadding_170gs_28 > ._SidebarSection-content_170gs_24:last-child {
  padding-bottom: 4px;
}
._SidebarSection_170gs_1:last-of-type ._SidebarSection-content_170gs_24 {
  border-bottom: none;
  flex-grow: 1;
}
._SidebarSection-breadcrumbLabel_170gs_41 {
  color: var(--puck-color-azure-3);
  flex-shrink: 0;
}
._SidebarSection-breadcrumbLabel_170gs_41:hover {
  color: var(--puck-color-azure-4);
  cursor: pointer;
  text-decoration: underline;
}
._SidebarSection-breadcrumbs_170gs_52 {
  align-items: center;
  display: flex;
  gap: 4px;
}
._SidebarSection-breadcrumb_170gs_41 {
  align-items: center;
  display: flex;
  gap: 4px;
}
._SidebarSection-heading_170gs_64 {
  padding-right: 16px;
}
._SidebarSection-loadingOverlay_170gs_68 {
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 1;
  pointer-events: all;
  box-sizing: border-box;
  opacity: 0.8;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Heading/styles.module.css/#css-module-data */
._Heading_1bvy5_1 {
  display: block;
  color: var(--puck-color-black);
  font-family: var(--puck-font-stack);
  font-weight: 700;
  margin: 0;
}
._Heading_1bvy5_1 b {
  font-weight: 700;
}
._Heading--xxxxl_1bvy5_13 {
  font-size: var(--puck-font-size-xxxxl);
  letter-spacing: 0.08ch;
  font-weight: 800;
}
._Heading--xxxl_1bvy5_19 {
  font-size: var(--puck-font-size-xxxl);
}
._Heading--xxl_1bvy5_23 {
  font-size: var(--puck-font-size-xxl);
}
._Heading--xl_1bvy5_27 {
  font-size: var(--puck-font-size-xl);
}
._Heading--l_1bvy5_31 {
  font-size: var(--puck-font-size-l);
}
._Heading--m_1bvy5_35 {
  font-size: var(--puck-font-size-m);
}
._Heading--s_1bvy5_39 {
  font-size: var(--puck-font-size-s);
}
._Heading--xs_1bvy5_43 {
  font-size: var(--puck-font-size-xs);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/MenuBar/styles.module.css/#css-module-data */
._MenuBar_12sp7_1 {
  background-color: var(--puck-color-white);
  border-bottom: 1px solid var(--puck-color-grey-8);
  display: none;
  left: 0;
  margin-top: 1px;
  padding: 8px 16px;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 2;
}
._MenuBar--menuOpen_12sp7_14 {
  display: block;
}
@media (min-width: 638px) {
  ._MenuBar_12sp7_1 {
    border: none;
    display: block;
    margin-top: 0;
    overflow-y: visible;
    padding: 0;
    position: static;
  }
}
._MenuBar-inner_12sp7_29 {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: flex-end;
}
@media (min-width: 638px) {
  ._MenuBar-inner_12sp7_29 {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
}
._MenuBar-history_12sp7_45 {
  display: flex;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/styles.module.css/#css-module-data */
._Puck_17hk3_19 {
  --puck-frame-width: auto;
  --puck-side-bar-width: 186px;
  --puck-space-px: 16px;
  bottom: 0;
  display: grid;
  grid-template-areas: "header header header" "left editor right";
  grid-template-columns: 0 var(--puck-frame-width) 0;
  grid-template-rows: min-content auto;
  height: 100vh;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
}
._Puck--leftSideBarVisible_17hk3_35 {
  grid-template-columns: var(--puck-side-bar-width) var(--puck-frame-width) 0;
}
._Puck--rightSideBarVisible_17hk3_41 {
  grid-template-columns: 0 var(--puck-frame-width) var(--puck-side-bar-width);
}
._Puck--leftSideBarVisible_17hk3_35._Puck--rightSideBarVisible_17hk3_41 {
  grid-template-columns: var(--puck-side-bar-width) var(--puck-frame-width) var(--puck-side-bar-width);
}
@media (min-width: 458px) {
  ._Puck_17hk3_19 {
    --puck-frame-width: minmax(266px, auto);
  }
}
@media (min-width: 638px) {
  ._Puck_17hk3_19 {
    --puck-side-bar-width: minmax(186px, 250px);
  }
}
@media (min-width: 766px) {
  ._Puck_17hk3_19 {
    --puck-frame-width: auto;
  }
}
@media (min-width: 990px) {
  ._Puck_17hk3_19 {
    --puck-side-bar-width: 256px;
  }
}
@media (min-width: 1198px) {
  ._Puck_17hk3_19 {
    --puck-side-bar-width: 274px;
  }
}
@media (min-width: 1398px) {
  ._Puck_17hk3_19 {
    --puck-side-bar-width: 290px;
  }
}
@media (min-width: 1598px) {
  ._Puck_17hk3_19 {
    --puck-side-bar-width: 320px;
  }
}
._Puck-header_17hk3_95 {
  background: var(--puck-color-white);
  border-bottom: 1px solid var(--puck-color-grey-8);
  color: var(--puck-color-black);
  grid-area: header;
  position: relative;
  max-width: 100vw;
}
._Puck-headerInner_17hk3_104 {
  align-items: end;
  display: grid;
  gap: var(--puck-space-px);
  grid-template-areas: "left middle right";
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto;
  padding: var(--puck-space-px);
}
._Puck-headerToggle_17hk3_114 {
  color: var(--puck-color-grey-4);
  display: flex;
  margin-left: -4px;
  padding-top: 2px;
}
._Puck--rightSideBarVisible_17hk3_41 ._Puck-rightSideBarToggle_17hk3_121,
._Puck--leftSideBarVisible_17hk3_35 ._Puck-leftSideBarToggle_17hk3_122 {
  color: var(--puck-color-black);
}
._Puck-headerTitle_17hk3_126 {
  align-self: center;
}
._Puck-headerPath_17hk3_130 {
  font-family: var(--puck-font-family-monospaced);
  font-size: var(--puck-font-size-xxs);
  font-weight: normal;
  word-break: break-all;
}
._Puck-headerTools_17hk3_137 {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}
._Puck-menuButton_17hk3_143 {
  color: var(--puck-color-grey-4);
  margin-left: -4px;
}
._Puck--menuOpen_17hk3_148 ._Puck-menuButton_17hk3_143 {
  color: var(--puck-color-black);
}
@media (min-width: 638px) {
  ._Puck-menuButton_17hk3_143 {
    display: none;
  }
}
._Puck-leftSideBar_17hk3_122 {
  background: var(--puck-color-grey-11);
  border-right: 1px solid var(--puck-color-grey-8);
  display: flex;
  flex-direction: column;
  grid-area: left;
  overflow-y: auto;
}
._Puck-frame_17hk3_167 {
  display: flex;
  flex-direction: column;
  grid-area: editor;
  overflow: auto;
  position: relative;
}
._Puck-root_17hk3_175 {
  border: 1px solid var(--puck-color-grey-8);
  box-shadow: 0 0 0 calc(var(--puck-space-px) * 1.5) var(--puck-color-grey-10);
  margin: var(--puck-space-px);
  min-width: 321px;
}
@media (min-width: 1198px) {
  ._Puck-root_17hk3_175 {
    margin: calc(var(--puck-space-px) * 1.5);
  }
}
._Puck-rightSideBar_17hk3_121 {
  background: var(--puck-color-white);
  border-left: 1px solid var(--puck-color-grey-8);
  display: flex;
  flex-direction: column;
  font-family: var(--puck-font-stack);
  grid-area: right;
  overflow-y: auto;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/InputOrGroup/styles.module.css/#css-module-data */
._Input_1v7zr_1 {
  color: var(--puck-color-grey-3);
  padding: 16px;
  padding-bottom: 12px;
  display: block;
  font-family: var(--puck-font-stack);
}
._Input_1v7zr_1 ._Input_1v7zr_1 {
  padding: 0px;
}
._Input_1v7zr_1 * {
  box-sizing: border-box;
}
._Input_1v7zr_1 + ._Input_1v7zr_1 {
  border-top: 1px solid var(--puck-color-grey-8);
  margin-top: 8px;
}
._Input_1v7zr_1 ._Input_1v7zr_1 + ._Input_1v7zr_1 {
  border-top: 0px;
  margin-top: 12px;
}
._Input-label_1v7zr_27 {
  align-items: center;
  display: flex;
  padding-bottom: 12px;
  font-size: var(--puck-font-size-xxs);
  font-weight: 600;
}
._Input-labelIcon_1v7zr_35 {
  color: var(--puck-color-grey-6);
  margin-right: 4px;
  padding-left: 4px;
}
._Input-disabledIcon_1v7zr_41 {
  color: var(--puck-color-grey-4);
  margin-left: auto;
}
._Input-input_1v7zr_46 {
  background: white;
  border-width: 1px;
  border-style: solid;
  border-color: var(--puck-color-grey-8);
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  padding: 12px 15px;
  width: 100%;
}
select._Input-input_1v7zr_46 {
  appearance: none;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23c3c3c3'><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
  background-size: 12px;
  background-position: calc(100% - 12px) calc(50% + 3px);
  background-repeat: no-repeat;
  background-color: white;
}
._Input--readOnly_1v7zr_69 > ._Input-input_1v7zr_46,
._Input--readOnly_1v7zr_69 > select._Input-input_1v7zr_46 {
  background-color: var(--puck-color-grey-11);
  border-color: var(--puck-color-grey-8);
  color: var(--puck-color-grey-5);
  opacity: 1;
}
._Input-input_1v7zr_46:hover {
  border-color: var(--puck-color-neutral-3);
}
._Input-input_1v7zr_46:focus {
  border-color: var(--puck-color-azure-4);
  outline: var(--puck-color-azure-8) 4px solid;
  outline-offset: 0;
}
._Input-radioGroupItems_1v7zr_87 {
  display: flex;
  border: 1px solid var(--puck-color-grey-7);
  border-radius: 4px;
  flex-wrap: wrap;
  overflow: hidden;
}
._Input-radio_1v7zr_87 {
  border-right: 1px solid var(--puck-color-grey-7);
  flex-grow: 1;
}
._Input-radio_1v7zr_87:last-of-type {
  border-right: none;
}
._Input-radioInner_1v7zr_104 {
  background-color: white;
  color: var(--puck-color-grey-4);
  font-size: var(--puck-font-size-xxxs);
  padding: 8px 12px;
  text-align: center;
}
._Input-radioInner_1v7zr_104:hover {
  background-color: var(--puck-color-azure-9);
  cursor: pointer;
}
._Input--readOnly_1v7zr_69 ._Input-radioGroupItems_1v7zr_87 {
  border-color: var(--puck-color-grey-8);
}
._Input--readOnly_1v7zr_69 ._Input-radioInner_1v7zr_104 {
  background-color: var(--puck-color-grey-11);
  color: var(--puck-color-grey-5);
}
._Input-radio_1v7zr_87 ._Input-radioInput_1v7zr_126:checked ~ ._Input-radioInner_1v7zr_104 {
  background-color: var(--puck-color-azure-9);
  color: var(--puck-color-grey-1);
  font-weight: 500;
}
._Input--readOnly_1v7zr_69 ._Input-radioInput_1v7zr_126:checked ~ ._Input-radioInner_1v7zr_104 {
  background-color: var(--puck-color-azure-9);
  color: var(--puck-color-grey-4);
}
._Input-radio_1v7zr_87 ._Input-radioInput_1v7zr_126 {
  display: none;
}
textarea._Input-input_1v7zr_46 {
  margin-bottom: -4px;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/InputOrGroup/fields/ArrayField/styles.module.css/#css-module-data */
._ArrayField_1auyc_5 {
  display: flex;
  flex-direction: column;
  background-color: var(--puck-color-grey-8);
  border: 1px solid var(--puck-color-grey-8);
  border-radius: 4px;
}
._ArrayField--isDraggingFrom_1auyc_13 {
  background-color: var(--puck-color-azure-9);
}
._ArrayField-addButton_1auyc_17 {
  background-color: white;
  border: none;
  border-radius: 4px;
  display: flex;
  color: var(--puck-color-azure-4);
  justify-content: center;
  cursor: pointer;
  width: 100%;
  margin: 0;
  padding: 16px;
  text-align: left;
}
._ArrayField--hasItems_1auyc_31 > ._ArrayField-addButton_1auyc_17 {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
._ArrayField_1auyc_5:not(._ArrayField--isDraggingFrom_1auyc_13) > ._ArrayField-addButton_1auyc_17:hover {
  background: var(--puck-color-azure-9);
  color: var(--puck-color-azure-4);
}
._ArrayFieldItem_1auyc_45 {
  background: white;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  display: block;
  margin-bottom: 1px;
}
._ArrayField--isDraggingFrom_1auyc_13 > ._ArrayFieldItem_1auyc_45:not(._ArrayFieldItem--isDragging_1auyc_53) {
  border-bottom: 1px solid var(--puck-color-grey-8);
  margin-bottom: 0;
}
._ArrayFieldItem--isExpanded_1auyc_58 {
  border-bottom: 0;
  outline-offset: 0px !important;
  outline: 1px solid var(--puck-color-azure-6) !important;
}
._ArrayFieldItem--isDragging_1auyc_53 {
  box-shadow: rgba(140, 152, 164, 0.25) 0 3px 6px 0;
}
._ArrayFieldItem_1auyc_45 + ._ArrayFieldItem_1auyc_45 {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
._ArrayFieldItem-summary_1auyc_73 {
  color: var(--puck-color-grey-3);
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  font-size: var(--puck-font-size-xxs);
  list-style: none;
  padding: 12px 15px;
  position: relative;
  overflow: hidden;
}
._ArrayFieldItem--readOnly_1auyc_86 > ._ArrayFieldItem-summary_1auyc_73 {
  background-color: var(--puck-color-grey-11);
  color: var(--puck-color-grey-5);
}
._ArrayFieldItem--isExpanded_1auyc_58 > ._ArrayFieldItem-summary_1auyc_73 {
  font-weight: 600;
}
._ArrayFieldItem_1auyc_45:first-of-type > ._ArrayFieldItem-summary_1auyc_73 {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
._ArrayFieldItem-summary_1auyc_73:hover,
._ArrayFieldItem--isExpanded_1auyc_58 > ._ArrayFieldItem-summary_1auyc_73 {
  background: var(--puck-color-azure-9);
  cursor: pointer;
  color: var(--puck-color-azure-4);
}
._ArrayFieldItem-body_1auyc_107 {
  display: none;
}
._ArrayFieldItem--isExpanded_1auyc_58 > ._ArrayFieldItem-body_1auyc_107 {
  display: block;
}
._ArrayFieldItem-fieldset_1auyc_115 {
  border: none;
  border-top: 1px solid var(--puck-color-grey-8);
  margin: 0;
  padding: 16px 15px;
  min-width: 0;
}
._ArrayFieldItem-rhs_1auyc_122 {
  display: flex;
  gap: 4px;
  align-items: center;
}
._ArrayFieldItem-actions_1auyc_128 {
  color: var(--puck-color-grey-3);
  display: flex;
  gap: 4px;
  opacity: 0;
}
._ArrayFieldItem-summary_1auyc_73:hover > ._ArrayFieldItem-rhs_1auyc_122 > ._ArrayFieldItem-actions_1auyc_128 {
  opacity: 1;
}
._ArrayFieldItem-action_1auyc_128:hover {
  background: var(--puck-color-grey-9);
  border-radius: 4px;
  cursor: pointer;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/ExternalInput/styles.module.css/#css-module-data */
._ExternalInput_s6fxy_1 {
  font-family: var(--puck-font-stack);
}
._ExternalInput-actions_s6fxy_5 {
  display: flex;
}
._ExternalInput-button_s6fxy_9 {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid var(--puck-color-grey-8);
  border-radius: 4px;
  color: var(--puck-color-azure-4);
  padding: 12px 16px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
}
._ExternalInput-button_s6fxy_9:hover,
._ExternalInput-detachButton_s6fxy_28:hover {
  cursor: pointer;
  background: var(--puck-color-azure-9);
  color: var(--puck-color-azure-4);
  z-index: 1;
}
._ExternalInput--dataSelected_s6fxy_35 ._ExternalInput-button_s6fxy_9 {
  color: var(--puck-color-grey-2);
  display: block;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}
._ExternalInput-detachButton_s6fxy_28 {
  border: 1px solid var(--puck-color-grey-8);
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  background-color: var(--puck-color-grey-11);
  color: var(--puck-color-grey-4);
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  margin-left: -1px;
}
._ExternalInputModal_s6fxy_56 {
  color: black;
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: 90vh;
}
._ExternalInputModal-masthead_s6fxy_64 {
  background-color: white;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 32px 24px;
}
._ExternalInputModal-tableWrapper_s6fxy_72 {
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  flex-grow: 1;
}
._ExternalInputModal-table_s6fxy_72 {
  border-collapse: unset;
  border-spacing: 0px;
  color: var(--puck-color-neutral-4);
  position: relative;
  z-index: 0;
  min-width: 100%;
}
._ExternalInputModal-thead_s6fxy_88 {
  position: sticky;
  top: 0;
  z-index: 1;
}
._ExternalInputModal-th_s6fxy_88 {
  border-bottom: 1px solid var(--puck-color-grey-8);
  border-top: 1px solid var(--puck-color-grey-8);
  font-weight: 700;
  padding: 16px 24px;
  opacity: 0.9;
}
._ExternalInputModal-td_s6fxy_102 {
  font-family: var(--puck-font-stack);
  padding: 16px 24px;
}
._ExternalInputModal-tr_s6fxy_107:nth-of-type(n) {
  background-color: white;
}
._ExternalInputModal-tr_s6fxy_107:nth-of-type(2n) {
  background-color: var(--puck-color-grey-10);
}
._ExternalInputModal-tr_s6fxy_107 ._ExternalInputModal-td_s6fxy_102:first-of-type {
  font-weight: 500;
}
._ExternalInputModal-tbody_s6fxy_119 ._ExternalInputModal-tr_s6fxy_107:hover {
  background: var(--puck-color-grey-11);
  color: var(--puck-color-azure-4);
  cursor: pointer;
  position: relative;
  margin-left: -5px;
}
._ExternalInputModal-tbody_s6fxy_119 ._ExternalInputModal-tr_s6fxy_107:hover ._ExternalInputModal-td_s6fxy_102:first-of-type {
  border-left: 4px solid var(--puck-color-azure-4);
  padding-left: 20px;
}
._ExternalInputModal-tableWrapper_s6fxy_72 {
  display: none;
}
._ExternalInputModal--hasData_s6fxy_138 ._ExternalInputModal-tableWrapper_s6fxy_72 {
  display: block;
}
._ExternalInputModal-loadingBanner_s6fxy_142 {
  display: none;
  background-color: #ffffff90;
  padding: 64px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
._ExternalInputModal--isLoading_s6fxy_155 ._ExternalInputModal-loadingBanner_s6fxy_142 {
  display: flex;
}
._ExternalInputModal-noContentBanner_s6fxy_159 {
  display: none;
  border-top: 1px solid var(--puck-color-grey-8);
  padding: 24px;
  text-align: center;
}
._ExternalInputModal--loaded_s6fxy_166:not(._ExternalInputModal--hasData_s6fxy_138) ._ExternalInputModal-noContentBanner_s6fxy_159 {
  display: block;
}
._ExternalInputModal-searchForm_s6fxy_171 {
  display: flex;
  margin-left: auto;
  height: 43px;
  gap: 12px;
}
._ExternalInputModal-search_s6fxy_171 {
  display: flex;
  background: white;
  border-width: 1px;
  border-style: solid;
  border-color: var(--puck-color-grey-8);
  border-radius: 4px;
  width: 100%;
}
._ExternalInputModal-search_s6fxy_171:focus-within {
  border-color: var(--puck-color-azure-4);
  outline: var(--puck-color-azure-8) 4px solid;
  outline-offset: 0;
}
._ExternalInputModal-searchIcon_s6fxy_194 {
  align-items: center;
  background: var(--puck-color-grey-11);
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  border-right: 1px solid var(--puck-color-grey-8);
  color: var(--puck-color-grey-6);
  display: flex;
  justify-content: center;
  padding: 12px 15px;
}
._ExternalInputModal-searchIconText_s6fxy_206 {
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
._ExternalInputModal-searchInput_s6fxy_216 {
  border: none;
  border-radius: 4px;
  background: white;
  font-family: inherit;
  font-size: 14px;
  padding: 12px 15px;
  width: 100%;
}
._ExternalInputModal-searchInput_s6fxy_216:focus {
  border: none;
  outline: none;
  box-shadow: none;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Modal/styles.module.css/#css-module-data */
._Modal_hx2u6_1 {
  background: #00000099;
  display: none;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  padding: 64px;
}
._Modal--isOpen_hx2u6_15 {
  display: flex;
}
._Modal-inner_hx2u6_19 {
  width: 100%;
  max-width: 1024px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/InputOrGroup/fields/ObjectField/styles.module.css/#css-module-data */
._ObjectField_56z4t_5 {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid var(--puck-color-grey-8);
  border-radius: 4px;
}
._ObjectField-fieldset_56z4t_13 {
  border: none;
  margin: 0;
  padding: 16px 15px;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Fields/styles.module.css/#css-module-data */
._PuckFields_1276r_1 {
  position: relative;
}
._PuckFields-loadingOverlay_1276r_5 {
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 1;
  pointer-events: all;
  box-sizing: border-box;
  opacity: 0.8;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/ComponentList/styles.module.css/#css-module-data */
._ComponentList_1di93_1 {
  font-family: var(--puck-font-stack);
  max-width: 100%;
}
._ComponentList--isExpanded_1di93_6 + ._ComponentList_1di93_1 {
  margin-top: 12px;
}
._ComponentList-content_1di93_10 {
  display: none;
}
._ComponentList--isExpanded_1di93_6 > ._ComponentList-content_1di93_10 {
  display: block;
}
._ComponentList-title_1di93_18 {
  color: var(--puck-color-grey-4);
  display: flex;
  font-size: var(--puck-font-size-xxxs);
  list-style: none;
  padding: 8px;
  text-transform: uppercase;
  gap: 4px;
  border-radius: 4px;
}
._ComponentList--isExpanded_1di93_6 ._ComponentList-title_1di93_18 {
  margin-bottom: 4px;
}
._ComponentList-title_1di93_18:hover {
  background-color: var(--puck-color-azure-9);
  color: var(--puck-color-azure-4);
  cursor: pointer;
}
._ComponentList-titleIcon_1di93_39 {
  margin-left: auto;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/LayerTree/styles.module.css/#css-module-data */
._LayerTree_o89yt_1 {
  color: var(--puck-color-grey-2);
  font-family: var(--puck-font-stack);
  font-size: var(--puck-font-size-xxs);
  margin: 0;
  position: relative;
  list-style: none;
  padding: 0;
}
._LayerTree-zoneTitle_o89yt_11 {
  color: var(--puck-color-grey-4);
  font-size: var(--puck-font-size-xxxs);
  text-transform: uppercase;
}
._LayerTree-helper_o89yt_17 {
  text-align: center;
  color: var(--puck-color-grey-6);
  font-family: var(--puck-font-stack);
  margin: 8px 4px;
}
._Layer_o89yt_1 {
  position: relative;
  border: 1px solid transparent;
}
._Layer-inner_o89yt_29 {
  padding-left: 12px;
  padding-right: 4px;
  border-radius: 4px;
}
._Layer--containsZone_o89yt_35 > ._Layer-inner_o89yt_29 {
  padding-left: 0;
}
._Layer-clickable_o89yt_39 {
  align-items: center;
  display: flex;
}
._Layer-inner_o89yt_29:hover {
  cursor: pointer;
}
._Layer_o89yt_1:not(._Layer--isSelected_o89yt_48) > ._Layer-inner_o89yt_29:hover,
._Layer--isHovering_o89yt_49 > ._Layer-inner_o89yt_29 {
  color: var(--puck-color-blue);
  background: var(--puck-color-azure-85);
}
._Layer--isSelected_o89yt_48 {
  background: var(--puck-color-azure-9);
  border-color: var(--puck-color-azure-7);
  border-radius: 4px;
}
._Layer--isSelected_o89yt_48 > ._Layer-inner_o89yt_29 {
  background: var(--puck-color-azure-85);
  font-weight: 600;
}
._Layer--isSelected_o89yt_48 > ._Layer-inner_o89yt_29 > ._Layer-clickable_o89yt_39 > ._Layer-chevron_o89yt_65,
._Layer--childIsSelected_o89yt_66 > ._Layer-inner_o89yt_29 > ._Layer-clickable_o89yt_39 > ._Layer-chevron_o89yt_65 {
  transform: scaleY(-1);
}
._Layer-zones_o89yt_70 {
  display: none;
  margin-left: 12px;
}
._Layer--isSelected_o89yt_48 > ._Layer-zones_o89yt_70,
._Layer--childIsSelected_o89yt_66 > ._Layer-zones_o89yt_70 {
  display: block;
}
._Layer-zones_o89yt_70 > ._LayerTree_o89yt_1 {
  margin-left: 12px;
}
._Layer-title_o89yt_84,
._LayerTree-zoneTitle_o89yt_11 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 8px 4px;
  overflow-x: hidden;
}
._Layer-name_o89yt_93 {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
._Layer-icon_o89yt_99 {
  color: var(--puck-color-rose-6);
  margin-top: 4px;
}
._Layer-zoneIcon_o89yt_104 {
  color: var(--puck-color-grey-7);
  margin-top: 4px;
}`;
