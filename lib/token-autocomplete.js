class TokenAutocomplete {

    defaults = {
        originList: [],
        destinationList: []
    };

    constructor(options = {}) {
        this.options = this.mergeOptions(this.defaults, options);

        this.container = document.querySelector(this.options.selector);
        this.container.classList.add('token-autocomplete-container');

        this.hiddenSelect = document.createElement('select');
        this.hiddenSelect.id = this.container.id + '-select';
        this.hiddenSelect.style.display = 'none';

        this.tokens = document.createElement('span');
        this.tokens.id = this.container.id + '-tokens';
        this.tokens.classList.add('token-autocomplete-tokens');

        this.textInput = document.createElement('span');
        this.textInput.id = this.container.id + '-input';
        this.textInput.classList.add('token-autocomplete-input');
        this.textInput.setAttribute('data-placeholder', 'enter some text');
        this.textInput.contentEditable = true;

        this.container.appendChild(this.tokens);
        this.container.appendChild(this.textInput);
        this.container.appendChild(this.hiddenSelect);

        let me = this;

        if (Array.isArray(this.options.initialTokens)) {
            this.options.initialTokens.forEach(function (token) {
                if (typeof token === 'string') {
                    me.addToken(token);
                }                
            });
        }

        this.textInput.addEventListener('keydown', function (event) {
            if (event.which == 13 || event.keyCode == 13) {
                event.preventDefault();
                me.addToken(me.textInput.textContent);
                me.textInput.textContent = '';
            } else if (me.textInput.textContent === '' && (event.which == 8 || event.keyCode == 8)) {
                event.preventDefault();
                me.removeLastToken();
            }
        });
    }

    addToken(tokenText) {
        var option = document.createElement('option');
        option.text = tokenText;
        this.hiddenSelect.add(option);

        var token = document.createElement('span');
        token.textContent = tokenText;
        this.tokens.appendChild(token);
        
        console.log('added token', token);
    }

    removeLastToken() {
        let token = this.tokens.lastChild;


        this.tokens.removeChild(token);
        
        console.log('removed token', token.textContent);
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