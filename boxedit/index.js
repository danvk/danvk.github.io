function render(el, isDemo) {
  var props = {};
  if (isDemo) {
    props.initialBoxData = boxData();
    // make sure the image is cached
    var im = new Image();
    im.onload = function() {
      props.initialImageUri = '700045bu.jpg';
      props.initialImageHeight = im.height;
      var component = React.createElement(Root, React.__spread({},  props));
      React.render(component, el);
    };
    im.src = '700045bu.jpg';
  } else {
    var component = React.createElement(Root, null);
    return React.render(component, el);
  }
}

var Root = React.createClass({displayName: 'Root',
  /*
  stateTypes: {
    imageDataUri: React.PropTypes.string,
    boxData: React.PropTypes.string,
    imageHeight: React.PropTypes.number,
    lettersVisible: React.PropTypes.bool,
    selectedBoxIndex: React.PropTypes.number
  },
  */
  getInitialState: function() {
    return {
      boxData: this.props.initialBoxData || '',
      // 1x1 transparent gif
      imageDataUri: this.props.initialImageUri || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      imageHeight: this.props.initialImageHeight || null,
      lettersVisible: true,
      selectedBox: null
    }
  },
  handleImage: function(imageDataUri) {
    var im = new Image();
    im.onload = function()  {
      // image height is only available in onload in FF/Safari
      console.log(im.height);
      this.setState({
        imageDataUri:imageDataUri,
        imageHeight: im.height
      });
    }.bind(this);
    im.src = imageDataUri;
  },
  handleBox: function(boxData) {
    this.setState({boxData:boxData});
  },
  handleLettersVisibleChanged: function(visible) {
    this.setState({lettersVisible: visible});
  },
  handleChangeSelection: function(selectedBoxIndex) {
    this.setState({selectedBoxIndex:selectedBoxIndex});
  },
  handleChangeLetter: function(lineIndex, newLetter) {
    this.setState({
      boxData: changeLetter(this.state.boxData, lineIndex, newLetter),
      selectedBoxIndex: lineIndex + 1
    });
  },
  handleSplit: function(numWays) {
    this.setState({
      boxData: splitLine(this.state.boxData,
                         this.state.selectedBoxIndex,
                         numWays)
    });
  },
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement(FileUpload, React.__spread({},  this.state, 
                    {onSplit: this.handleSplit, 
                    onChangeImage: this.handleImage, 
                    onChangeBox: this.handleBox, 
                    onChangeLettersVisible: this.handleLettersVisibleChanged})), 
        React.createElement(TextView, React.__spread({onChangeBox: this.handleBox, 
                  onChangeSelection: this.handleChangeSelection}, 
                  this.state)), 
        React.createElement(ImageView, React.__spread({onChangeSelection: this.handleChangeSelection, 
                   onChangeLetter: this.handleChangeLetter, 
                   onSplit: this.handleSplit, 
                   onChangeImage: this.handleImage, 
                   onChangeBox: this.handleBox}, 
                   this.state))
      )
    );
  }
});


var FileUpload = React.createClass({displayName: 'FileUpload',
  handleNewBox: function(file) {
    var reader = new FileReader();
    reader.onload = function(e)  {
      this.props.onChangeBox(e.target.result);
    }.bind(this);

    reader.readAsText(file);
  },
  handleNewImage: function(file) {
    var reader = new FileReader();
    reader.onload = function(e)  {
      this.props.onChangeImage(e.target.result);
    }.bind(this);

    reader.readAsDataURL(file);
  },
  handleLettersVisibleChanged: function() {
    this.props.onChangeLettersVisible(this.refs.check.getDOMNode().checked);
  },
  handleSplit: function(e) {
    this.props.onSplit(Number(e.target.value));
  },
  render: function() {
    var splitter;
    if (this.props.selectedBoxIndex !== null) {
      splitter = (
        React.createElement("select", {value: "none", onChange: this.handleSplit}, 
          React.createElement("option", {value: "none"}, "Split"), 
          React.createElement("option", {value: "2"}, "2 ways"), 
          React.createElement("option", {value: "3"}, "3 ways"), 
          React.createElement("option", {value: "4"}, "4 ways"), 
          React.createElement("option", {value: "5"}, "5 ways")
        )
      );
    }
    return (
      React.createElement("div", {className: "upload"}, 
        "Drag a .box file here: ", React.createElement(DropZone, {onDrop: this.handleNewBox}), 
        "And an image file here: ", React.createElement(DropZone, {onDrop: this.handleNewImage}), 
        React.createElement("input", {ref: "check", type: "checkbox", checked: this.props.lettersVisible, onChange: this.handleLettersVisibleChanged, id: "letters-visible"}), React.createElement("label", {htmlFor: "letters-visible"}, 
          "Show letters"), 
        splitter
      )
    );
  }
});


// Should use https://github.com/Khan/react-components/blob/master/js/drag-target.jsx
var DropZone = React.createClass({displayName: 'DropZone',
  propTypes: {
    onDrop: React.PropTypes.func.isRequired
  },
  onFileSelect: function(e) {
    var files = e.target.files;
    if (files.length === 0) return;
    if (files.length > 1) {
      window.alert('You may only upload one file at a time.');
      return;
    }
    this.props.onDrop(files[0]);
  },
  render: function() {
    return React.createElement("input", {type: "file", onChange: this.onFileSelect});
  }
});

var TextView = React.createClass({displayName: 'TextView',
  handleChange: function() {
    this.props.onChangeBox(this.refs.textbox.getDOMNode().value);
  },
  checkSelection: function() {
    var lineIndex = this.currentlySelectedLineIndex();
    if (lineIndex != this.props.selectedBoxIndex) {
      this.props.onChangeSelection(lineIndex);
    }
  },
  currentlySelectedLineIndex: function() {
    var selStart = this.refs.textbox.getDOMNode().selectionStart;
    return countLines(this.props.boxData, selStart);
  },
  componentDidUpdate: function() {
    var lineIndex = this.currentlySelectedLineIndex();
    if (lineIndex != this.props.selectedBoxIndex) {
      var tb = this.refs.textbox.getDOMNode(),
          text = this.props.boxData,
          idx = this.props.selectedBoxIndex;

      var oldActive = document.activeElement;
      tb.selectionStart = startOfLinePosition(text, idx);
      tb.selectionEnd = startOfLinePosition(text, idx + 1) - 1;
      oldActive.focus();
    }
  },
  render: function() {
    return (
      React.createElement("div", {className: "text-view"}, 
        React.createElement("textarea", {ref: "textbox", 
                  value: this.props.boxData, 
                  onClick: this.checkSelection, 
                  onKeyUp: this.checkSelection, 
                  onChange: this.handleChange})
      )
    );
  }
});

var ImageView = React.createClass({displayName: 'ImageView',
  getInitialState: function()  {return {dragHover: false};},
  makeBoxes: function(text) {
    if (!text || text.length == 0) return [];
    return text.split('\n').map(parseBoxLine);
  },
  transform: function(boxesImageCoords) {
    var height = this.props.imageHeight ||
                 Math.max.apply(null, boxesImageCoords.map(function(c)  {return c.top;}));
    return boxesImageCoords.map(function(box)  {return {
      letter: box.letter,
      left: box.left,
      right: box.right,
      top: height - box.bottom,
      bottom: height - box.top
    };});
  },
  handleBoxClick: function(index) {
    this.props.onChangeSelection(index);
  },
  handleKeyPress: function(e) {
    if (document.activeElement != document.body) return;
    var c = String.fromCharCode(e.charCode);
    // if (e.altKey && /^[0-9]$/.match(c)) {
    //   e.preventDefault();
    //   this.props.onSplit(Number(c));
    // }

    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // TODO: use a blacklist instead of a whitelist?
    if (/^[-0-9a-zA-Z()\[\]{}!@#$%^&*=~?.,:;'"\/\\]$/.exec(c)) {
      e.preventDefault();
      this.props.onChangeLetter(this.props.selectedBoxIndex, c);
    }
  },
  componentDidUpdate: function() {
    if (this.props.selectedBoxIndex === null) return;

    var div = this.getDOMNode(),
        box = div.querySelectorAll('.box')[this.props.selectedBoxIndex];
    if (box) {
      box.scrollIntoViewIfNeeded();   // <-- cross-platform?
    }
  },
  componentDidMount: function() {
    document.addEventListener('keypress', this.handleKeyPress);
  },

  // https://github.com/Khan/react-components/blob/master/js/drag-target.jsx
  handleDrop: function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ dragHover: false });
    this.handleFileDrop(e.nativeEvent.dataTransfer.files);
  },
  handleDragEnd: function() {
    this.setState({ dragHover: false });
  },
  handleDragOver: function(e) {
    e.preventDefault();
  },
  handleDragLeave: function(e) {
    this.setState({dragHover: false});
  },
  handleDragEnter: function(e) {
    this.setState({dragHover: true});
  },
  handleFileDrop: function(files) {
    var typedFiles = {
      image: null,
      box: null
    };
    [].forEach.call(files, function(f)  {
      if (f.type.slice(0, 6) == 'image/') {
        typedFiles.image = f;
      } else if (f.name.slice(-4) == '.box') {
        typedFiles.box = f;
      }
    });
    // TODO: lots of duplication with <FileUpload> here.
    if (typedFiles.image) {
      var reader = new FileReader();
      reader.onload = function(e)  { this.props.onChangeImage(e.target.result); }.bind(this);
      reader.readAsDataURL(typedFiles.image);
    }
    if (typedFiles.box) {
      var reader = new FileReader();
      reader.onload = function(e)  { this.props.onChangeBox(e.target.result); }.bind(this);
      reader.readAsText(typedFiles.box);
    }
  },

  render: function() {
    var boxesImageCoords = this.makeBoxes(this.props.boxData),
        boxesScreenCoords = this.transform(boxesImageCoords),
        boxes = boxesScreenCoords.map(
            function(data, i)  {return React.createElement(Box, React.__spread({key: i, 
                              index: i, 
                              isSelected: i === this.props.selectedBoxIndex, 
                              onClick: this.handleBoxClick}, 
                              this.props,  data));}.bind(this));
    var classes = React.addons.classSet({
      'image-viewer': true,
      'drag-hover': this.state.dragHover
    });
    var showHelp = !(this.props.boxData || this.props.imageHeight > 1);
    return (
      React.createElement("div", {className: classes, 
           onDragEnd: this.handleDragEng, 
           onDragOver: this.handleDragOver, 
           onDragLeave: this.handleDragLeave, 
           onDragEnter: this.handleDragEnter, 
           onDrop: this.handleDrop}, 
        React.createElement("img", {src: this.props.imageDataUri}), 
        boxes, 
        showHelp ? React.createElement(Help, null) : null
      )
    );
  }
});

var Box = React.createClass({displayName: 'Box',
  handleClick: function() {
    this.props.onClick(this.props.index);
  },
  render: function() {
    var style = {
      position: 'absolute',
      left: this.props.left + 'px',
      top: this.props.top + 'px',
      width: (this.props.right - this.props.left) + 'px',
      height: (this.props.bottom - this.props.top) + 'px'
    };
    var classes = React.addons.classSet({
      'box': true,
      'selected': this.props.isSelected
    });
    var letter = this.props.lettersVisible ? this.props.letter : '';
    return (
      React.createElement("div", {style: style, 
           className: classes, 
           onClick: this.handleClick, 
           onKeyPress: this.handleKey}, 
        letter
      )
    );
  }
});

var Help = React.createClass({displayName: 'Help',
  render: function() {
    return (
      React.createElement("div", {className: "help"}, 
        React.createElement("p", null, "To get going, drag a box file and an image onto this page:"), 
        React.createElement("img", {width: "936", height: "488", src: "https://raw.githubusercontent.com/danvk/boxedit/master/screenshots/drag-and-drop.png"}), 
        React.createElement("p", null, "Read more about how to use boxedit ", React.createElement("a", {href: "https://github.com/danvk/boxedit/blob/master/README.md"}, "on GitHub"), ", or check out a pre-loaded ", React.createElement("a", {href: "demo.html"}, "demo"), ".")
      )
    );
  }
});
