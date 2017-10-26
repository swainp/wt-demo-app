import React from 'react';

export default class App extends React.Component {

    render() {
      return(
        <footer class="footer">
          <div class="container">
            <img src="assets/wt.svg" style={{height: "24px", marginRight: "0.5em"}} />
              Winding Tree - <a href="#"> Github </a> - <a href="#"> Documentation </a>
          </div>
        </footer>
      );
    }

}
