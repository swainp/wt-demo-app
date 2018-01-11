import React from 'react';

export default class App extends React.Component {

    render() {
      return(
        <footer class="footer">
          <div class="container-fluid">
            <div class="row">
              <div class="col text-center">
                <a href="https://windingtree.com">
                  <img src="assets/wt.svg" style={{height: "24px", marginRight: "0.5em"}} />Winding Tree
                </a>
                <span className="text-muted"> · </span>
                <a href="https://github.com/windingtree/wt-demo-app">Github</a>
                <span className="text-muted"> · </span>
                <a href="https://windingtree.github.io/wt-js-libs/"> JS Libs Documentation</a>
              </div>
            </div>
          </div>
        </footer>
      );
    }

}
