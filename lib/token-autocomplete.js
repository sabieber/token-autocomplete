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

        this.textInput = document.createElement('span');
        this.textInput.id = this.container.id + '-input';
        this.textInput.classList.add('token-autocomplete-input');
        this.textInput.setAttribute('data-placeholder', 'enter some text');
        this.textInput.contentEditable = true;

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

        this.container.tokenAutocomplete = this;
    }

    addToken(tokenText) {
        var option = document.createElement('option');
        option.text = tokenText;
        this.hiddenSelect.add(option);

        var token = document.createElement('span');
        token.classList.add('token-autocomplete-token');
        token.textContent = tokenText;

        var deleteToken = document.createElement('span');
        deleteToken.classList.add('token-autocomplete-token-delete');
        deleteToken.textContent = '\u00D7';
        token.appendChild(deleteToken);

        let me = this;
        deleteToken.addEventListener('click', function (event) {
            me.removeToken(token);
        });

        this.container.insertBefore(token, this.textInput);
        
        console.log('added token', token);
    }

    removeAllTokens() {
        let tokens = this.container.querySelectorAll('.token-autocomplete-token');

        let me = this;
        tokens.forEach(function (token) {me.removeToken(token);});
    }

    removeLastToken() {
        let tokens = this.container.querySelectorAll('.token-autocomplete-token');
        let token = tokens[tokens.length - 1];
        this.removeToken(token);
    }

    removeToken(token) {
        this.container.removeChild(token);
        
        console.log('removed token', token.textContent);
    }

    val(value) {
        this.removeAllTokens();

        if (Array.isArray(value)) {
            let me = this;
            value.forEach(function (token) {
                if (typeof token === 'string') {
                    me.addToken(token);
                }                
            });
        } else {
            this.addToken(value);
        }
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