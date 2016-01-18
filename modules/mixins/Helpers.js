"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var animateScroll = require('./animate-scroll');
var scrollSpy = require('./scroll-spy');
var scroller = require('./scroller');

var Helpers = {

  Scroll: {

    propTypes: {
      to: React.PropTypes.string.isRequired,
      offset: React.PropTypes.number
    },

    getDefaultProps: function() {
      return {offset: 0};
    },

    scrollTo : function(to) {
      scroller.scrollTo(to, this.props.smooth, this.props.duration, this.props.offset);
    },

    onClick: function(event) {

      /*
       * give the posibility to override onClick
       */

      if(this.props.onClick) {
        this.props.onClick(event);
      }

      /*
       * dont bubble the navigation
       */

      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();

      /*
       * do the magic!
       */

      this.scrollTo(this.props.to);

    },

    componentDidMount: function() {
      scrollSpy.mount();

      if(this.props.spy) {
        this.__spyTo = this.props.to;
        this.__spyElement = null;
        this.__spyElemTopBound = 0;
        this.__spyElemBottomBound = 0;

        scrollSpy.addStateHandler(this.__stateHandler);

        scrollSpy.addSpyHandler(this.__spyHandler);
      }
    },
    componentWillUnmount: function() {
      scrollSpy.unmount({stateHandler: this.__stateHandler, spyHandler: this.__spyHandler});
    },
    __stateHandler: function() {
      if(scroller.getActiveLink() != this.__spyTo) {
          this.setState({ active : false });
      }
    },
    __spyHandler: function (y) {
      var to = this.__spyTo;
      var element = this.__spyElement;
      var elemTopBound = this.__spyElemTopBound;
      var elemBottomBound = this.__spyElemBottomBound;

      if(!element) {
          element = scroller.get(to);

          var cords = element.getBoundingClientRect();
          elemTopBound = (cords.top + y);
          elemBottomBound = elemTopBound + cords.height;
      }

      var offsetY = y - this.props.offset;
      var isInside = (offsetY >= elemTopBound && offsetY <= elemBottomBound);
      var isOutside = (offsetY < elemTopBound || offsetY > elemBottomBound);
      var activeLnik = scroller.getActiveLink();

      if (isOutside && activeLnik === to) {

        scroller.setActiveLink(void 0);
        this.setState({ active : false });

      } else if (isInside && activeLnik != to) {

        scroller.setActiveLink(to);
        this.setState({ active : true });
        if(this.props.onSetActive) this.props.onSetActive(to);
        scrollSpy.updateStates();
      }
    }
  },


  Element: {
    propTypes: {
      name: React.PropTypes.string.isRequired
    },
    componentDidMount: function() {
      var domNode = ReactDOM.findDOMNode(this);
      scroller.register(this.props.name, domNode);
    },
    componentWillUnmount: function() {
      scroller.unregister(this.props.name);
    }
  }
};

module.exports = Helpers;

