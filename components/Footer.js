import React from 'react';

export default class App extends React.Component {

    render() {
      return(
        <footer class="footer">
          <div class="container">
            <a href="https://windingtree.com"> <img src="assets/wt.svg" style={{height: "24px", marginRight: "0.5em"}} /> Winding Tree </a>
            - <a href="https://github.com/windingtree"> Github </a> - <a href="https://windingtree.github.io/wt-js-libs/"> Documentation </a>
          </div>
        </footer>
      );
    }

}
