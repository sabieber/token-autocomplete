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
                me.clearCurrentInput();
            } else if (me.textInput.textContent === '' && (event.which == 8 || event.keyCode == 8)) {
                event.preventDefault();
                me.removeLastToken();
            }
        });

        this.textInput.addEventListener('keyup', function (event) {
            me.hideSuggestions();
            me.clearSuggestions();
            if (me.textInput.textContent.length >= me.options.minCharactersForSuggestion) {
                let value = me.textInput.textContent;
                if (Array.isArray(me.options.initialSuggestions)) {
                    me.options.initialSuggestions.forEach(function (suggestion) {
                        if (typeof suggestion === 'string' && value === suggestion.slice(0, value.length)) {
                            me.addSuggestion(suggestion);
                        }                
                    });
                    if (me.suggestions.childNodes.length > 0) {
                        me.highlightSuggestion(0);
                    }
                }
            } else {
            }
        });

        this.container.tokenAutocomplete = this;
    }

    /**
     * Adds a token with the specified name to the list of currently prensent tokens displayed to the user and the hidden select.
     * 
     * @param {string} tokenText - the name of the token to create
     */
    addToken(tokenText) {
        var option = document.createElement('option');
        option.text = tokenText;
        option.setAttribute('data-text', tokenText);
        this.hiddenSelect.add(option);

        var token = document.createElement('span');
        token.classList.add('token-autocomplete-token');
        token.setAttribute('data-text', tokenText);
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

    /**
     * Completely clears the currently present tokens from the field.
     */
    removeAllTokens() {
        let tokens = this.container.querySelectorAll('.token-autocomplete-token');

        let me = this;
        tokens.forEach(function (token) {me.removeToken(token);});
    }


    /**
     * Removes the last token in the list of currently present token. This is the last added token next to the input field.
     */
    removeLastToken() {
        let tokens = this.container.querySelectorAll('.token-autocomplete-token');
        let token = tokens[tokens.length - 1];
        this.removeToken(token);
    }

    /**
     * Removes the specified token from the list of currently present tokens.
     * 
     * @param {Element} token - the token to remove
     */
    removeToken(token) {
        this.container.removeChild(token);

        let tokenText = token.getAttribute('data-text');
        let hiddenOption = this.hiddenSelect.querySelector('option[data-text="' + tokenText + '"]');
        hiddenOption.parentElement.removeChild(hiddenOption);
        
        console.log('removed token', token.textContent);
    }

    /**
     * Clears the currently present tokens and creates new ones from the given input value.
     * 
     * @param {(Array\|string)} value - either the name of a single token or a list of tokens to create
     */
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

    /**
     * Hides the suggestions dropdown from the user.
     */
    hideSuggestions() {
        this.suggestions.style.display = '';
    }

    /**
     * Shows the suggestions dropdown to the user.
     */
    showSuggestions() {
        this.suggestions.style.display = 'block';

        
    }

    highlightSuggestion(index) {
        let suggestions = this.suggestions.querySelectorAll('li');
        suggestions.forEach(function (suggestion) {
            suggestion.classList.remove('token-autocomplete-suggestion-highlighted');
        })
        suggestions[index].classList.add('token-autocomplete-suggestion-highlighted');
    }

    /**
     * Removes all previous suggestions from the dropdown.
     */
    clearSuggestions() {
        this.suggestions.innerHTML = '';
    }

    clearCurrentInput() {
        this.textInput.textContent = '';
    }

    /**
     * Adds a suggestion with the given text matching the users input to the dropdown.
     * 
     * @param {string} suggestionText - the text that should be displayed for the added suggestion
     */
    addSuggestion(suggestionText) {
        var option = document.createElement('li');
        option.textContent = suggestionText;

        let me = this;
        option.addEventListener('click', function (event) {
            me.addToken(suggestionText);
            me.clearSuggestions();
            me.hideSuggestions();
            me.clearCurrentInput();
        });

        this.suggestions.appendChild(option);
        this.showSuggestions();

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