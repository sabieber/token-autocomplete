class TokenAutocomplete {

    defaults = {
        originList: [],
        destinationList: []
    };

    constructor(options = {}) {
        this.options = this.mergeOptions(this.defaults, options);

        this.container = document.querySelector(this.options.selector);

        this.hiddenSelect = document.createElement('select');
        this.hiddenSelect.id = this.container.id + '-select';
        this.hiddenSelect.style.display = 'none';

        this.textInput = document.createElement('span');
        this.textInput.id = this.container.id + '-input';
        this.textInput.classList.add('token-autocomplete-input');
        this.textInput.setAttribute('data-placeholder', 'enter some text');
        this.textInput.contentEditable = true;

        this.container.appendChild(this.textInput);
        this.container.appendChild(this.hiddenSelect);

        let me = this;
        this.textInput.addEventListener('keypress', function (event) {
            if (event.which == 13 || event.keyCode == 13) {
                event.preventDefault();
                me.addToken(me.textInput.textContent);
                me.textInput.textContent = '';
            }
        });
    }

    addToken(token) {
        var option = document.createElement('option');
        option.text = token;
        this.hiddenSelect.add(option);
        
        console.log('added token', token);
    }

    mergeOptions(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }
}