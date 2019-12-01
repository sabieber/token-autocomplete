class TokenAutocomplete {

    defaults = {
        initialTokens: [],
        initialSuggestions: [],
        minCharactersForSuggestion: 1
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

        this.suggestions = document.createElement('ul');
        this.suggestions.id = this.container.id + '-suggestions';
        this.suggestions.classList.add('token-autocomplete-suggestions');

        this.container.appendChild(this.textInput);
        this.container.appendChild(this.hiddenSelect);
        this.container.appendChild(this.suggestions);

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

        this.textInput.addEventListener('keyup', function (event) {
            if (me.textInput.textContent.length >= me.options.minCharactersForSuggestion) {
                let value = me.textInput.textContent;
                me.suggestions.innerHTML = '';
                me.suggestions.style.display = '';
                if (Array.isArray(me.options.initialSuggestions)) {
                    me.options.initialSuggestions.forEach(function (suggestion) {
                        if (typeof suggestion === 'string' && value === suggestion.slice(0, value.length)) {
                            me.addSuggestion(suggestion);
                        }                
                    });
                }
            } else {
                me.suggestions.innerHTML = '';
                me.suggestions.style.display = '';
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

    addSuggestion(suggestionText) {
        var option = document.createElement('li');
        option.textContent = suggestionText;
        this.suggestions.appendChild(option);
        this.suggestions.style.display = 'block';

        console.log('added suggestion', suggestionText);
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