interface Token {
    value: string,
    text: string 
}

interface Suggestion {
    value: string,
    text: string 
}


interface Options {
    name: string,
    selector: string,
    noMatchesText: string | null,
    initialTokens: Array<Token> | null,
    initialSuggestions: Array<Suggestion> | null,
    suggestionsUri: string, 
    minCharactersForSuggestion: number
}

class TokenAutocomplete {

    KEY_BACKSPACE = 8;
    KEY_ENTER = 13;
    KEY_UP = 38;
    KEY_DOWN = 40;

    options: Options;
    container: any;
    hiddenSelect: HTMLSelectElement;
    textInput: HTMLSpanElement;
    suggestions: HTMLUListElement;

    defaults: Options = {
        name: '',
        selector: '',
        noMatchesText: null,
        initialTokens: null,
        initialSuggestions: null,
        suggestionsUri: '',
        minCharactersForSuggestion: 1
    };
    log: any;

    constructor(options: Options) {
        this.options = {...this.defaults, ...options};

        let passedContainer = document.querySelector(this.options.selector);
        if (!passedContainer) {
            throw new Error('passed selector does not point to a DOM element.');
        }

        this.container = passedContainer;
        this.container.classList.add('token-autocomplete-container');

        if (!Array.isArray(this.options.initialTokens) && !Array.isArray(this.options.initialSuggestions)) {
            this.parseTokensAndSuggestions();
        }

        this.hiddenSelect = document.createElement('select');
        this.hiddenSelect.id = this.container.id + '-select';
        this.hiddenSelect.name = this.options.name;
        this.hiddenSelect.setAttribute('multiple', 'true');
        this.hiddenSelect.style.display = 'none';

        this.textInput = document.createElement('span');
        this.textInput.id = this.container.id + '-input';
        this.textInput.classList.add('token-autocomplete-input');
        this.textInput.setAttribute('data-placeholder', 'enter some text');
        this.textInput.contentEditable = 'true';

        this.suggestions = document.createElement('ul');
        this.suggestions.id = this.container.id + '-suggestions';
        this.suggestions.classList.add('token-autocomplete-suggestions');

        this.container.appendChild(this.textInput);
        this.container.appendChild(this.hiddenSelect);
        this.container.appendChild(this.suggestions);

        this.debug(false);

        let me = this;

        if (Array.isArray(this.options.initialTokens)) {
            this.options.initialTokens.forEach(function (token) {
                if (typeof token === 'object') {
                    me.addToken(token.value, token.text);
                }                
            });
        }

        this.textInput.addEventListener('keydown', function (event) {
            if (event.which == me.KEY_ENTER || event.keyCode == me.KEY_ENTER) {
                event.preventDefault();
                
                let highlightedSuggestion = me.suggestions.querySelector('.token-autocomplete-suggestion-highlighted');
                if (highlightedSuggestion !== null) {
                    if (highlightedSuggestion.classList.contains('token-autocomplete-suggestion-active')) {
                        me.removeTokenWithText(highlightedSuggestion.textContent);
                    } else {
                        me.addToken(highlightedSuggestion.getAttribute('data-value'), highlightedSuggestion.textContent);
                    }
                    
                } else {
                    me.addToken(me.textInput.textContent, me.textInput.textContent);
                }

                me.clearCurrentInput();
            } else if (me.textInput.textContent === '' && (event.which == me.KEY_BACKSPACE || event.keyCode == me.KEY_BACKSPACE)) {
                event.preventDefault();
                me.removeLastToken();
            }
        });

        this.textInput.addEventListener('keyup', function (event) {
            if ((event.which == me.KEY_UP || event.keyCode == me.KEY_UP) && me.suggestions.childNodes.length > 0) {
                let highlightedSuggestion = me.suggestions.querySelector('.token-autocomplete-suggestion-highlighted');
                let aboveSuggestion = highlightedSuggestion?.previousSibling;
                if (aboveSuggestion != null) {
                    me.highlightSuggestion(aboveSuggestion as Element);
                }
                return;
            }
            if ((event.which == me.KEY_DOWN || event.keyCode == me.KEY_DOWN) && me.suggestions.childNodes.length > 0) {
                let highlightedSuggestion = me.suggestions.querySelector('.token-autocomplete-suggestion-highlighted');
                let belowSuggestion = highlightedSuggestion?.nextSibling;
                if (belowSuggestion != null) {
                    me.highlightSuggestion(belowSuggestion as Element);
                }
                return;
            }

            me.hideSuggestions();
            me.clearSuggestions();

            let value = me.textInput.textContent || '';
            if (value.length >= me.options.minCharactersForSuggestion) {
                if (Array.isArray(me.options.initialSuggestions)) {
                    me.options.initialSuggestions.forEach(function (suggestion) {
                        if (typeof suggestion !== 'object') {
                            // the suggestion is of wrong type and therefore ignored
                            return;
                        }
                        if (value.localeCompare(suggestion.text.slice(0, value.length), undefined, {sensitivity: 'base'}) === 0) {
                            // The suggestion starts with the query text the user entered and will be displayed
                            me.addSuggestion(suggestion.value, suggestion.text);
                        }                
                    });
                    if (me.suggestions.childNodes.length > 0) {
                        me.highlightSuggestionAtPosition(0);
                    } else if (me.options.noMatchesText) {
                        me.addSuggestion('_no_match_', me.options.noMatchesText);
                    }
                } else if (me.options.suggestionsUri.length > 0) {
                    me.requestSuggestions(value);
                }
            }
        });

        this.container.tokenAutocomplete = this as TokenAutocomplete;
    }

    /**
     * Searches the element given as a container for option elements and creates active tokens (when the option is marked selected)
     * and suggestions (all options found) from these. During this all found options are removed from the DOM.
     */
    parseTokensAndSuggestions() {
        let initialTokens: Array<Token> = [];
        let initialSuggestions: Array<Suggestion> = [];

        let options: NodeListOf<HTMLOptionElement> = this.container.querySelectorAll('option');

        let me = this;
        options.forEach(function (option) {
            if (option.text != null) {
                if (option.hasAttribute('selected')) {
                    initialTokens.push({value: option.value, text: option.text});
                }
                initialSuggestions.push({value: option.value, text: option.text});
            }
            me.container.removeChild(option);
        });

        if (initialTokens.length > 0) {
            this.options.initialTokens = initialTokens;
        }
        if (initialSuggestions.length > 0) {
            this.options.initialSuggestions = initialSuggestions;
        }
    }

    /**
     * Loads suggestions matching the given query from the rest service behind the URI given as an option while initializing the field.
     * 
     * @param query the query to search suggestions for
     */
    requestSuggestions(query: string) {
        let me = this;
        let request = new XMLHttpRequest();
        request.onload = function() {
            if (Array.isArray(request.response)) {
                request.response.forEach(function (suggestion) {
                   me.addSuggestion(suggestion.id, suggestion.text); 
                });
            }
        };
        request.open('GET', me.options.suggestionsUri + '?query=' + query, true);
        request.responseType = 'json';
        request.setRequestHeader('Content-type', 'application/json');
        request.send();
    }

    /**
     * Adds a token with the specified name to the list of currently prensent tokens displayed to the user and the hidden select.
     * 
     * @param {string} tokenText - the name of the token to create
     */
    addToken(tokenValue: string | null, tokenText: string | null) {
        if (tokenValue === null || tokenText === null) {
            return;
        }
        var option = document.createElement('option');
        option.text = tokenText;
        option.value = tokenValue;
        option.setAttribute('selected', 'true');
        option.setAttribute('data-text', tokenText);
        option.setAttribute('data-value', tokenValue);
        this.hiddenSelect.add(option);

        var token = document.createElement('span');
        token.classList.add('token-autocomplete-token');
        token.setAttribute('data-text', tokenText);
        option.setAttribute('data-value', tokenValue);
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
        
        this.log('added token', token);
    }

    /**
     * Completely clears the currently present tokens from the field.
     */
    removeAllTokens() {
        let tokens: NodeListOf<Element> = this.container.querySelectorAll('.token-autocomplete-token');
 
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
    removeToken(token: Element) {
        this.container.removeChild(token);

        let tokenText = token.getAttribute('data-text');
        let hiddenOption = this.hiddenSelect.querySelector('option[data-text="' + tokenText + '"]');
        hiddenOption?.parentElement?.removeChild(hiddenOption);
        
        this.log('removed token', token.textContent);
    }

    removeTokenWithText(tokenText: string | null) {
        if (tokenText === null) {
            return;
        }
        let token = this.container.querySelector('.token-autocomplete-token[data-text="' + tokenText + '"]');
        if (token !== null) {
            this.removeToken(token);
        }
    }

    /**
     * Clears the currently present tokens and creates new ones from the given input value.
     * 
     * @param {(Array\|string)} value - either the name of a single token or a list of tokens to create
     */
    val(value: Array<Token> | Token) {
        this.removeAllTokens();

        if (Array.isArray(value)) {
            let me = this;
            value.forEach(function (token) {
                if (typeof token === 'object') {
                    me.addToken(token.value, token.text);
                }                
            });
        } else {
            this.addToken(value.value, value.text);
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

    highlightSuggestionAtPosition(index: number) {
        let suggestions = this.suggestions.querySelectorAll('li');
        suggestions.forEach(function (suggestion) {
            suggestion.classList.remove('token-autocomplete-suggestion-highlighted');
        })
        suggestions[index].classList.add('token-autocomplete-suggestion-highlighted');
    }

    highlightSuggestion(suggestion: Element) {
        this.suggestions.querySelectorAll('li').forEach(function (suggestion) {
            suggestion.classList.remove('token-autocomplete-suggestion-highlighted');
        })
        suggestion.classList.add('token-autocomplete-suggestion-highlighted');
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

    debug(state: boolean) {
        if (state) {
            this.log = console.log.bind(window.console);
        } else {
            this.log = function () {}
        }
    }

    /**
     * Adds a suggestion with the given text matching the users input to the dropdown.
     * 
     * @param {string} suggestionText - the text that should be displayed for the added suggestion
     */
    addSuggestion(suggestionValue: string | null, suggestionText: string | null) {
        if (suggestionText === null || suggestionValue === null) {
            return;
        }
        var option = document.createElement('li');
        option.textContent = suggestionText;
        option.setAttribute('data-value', suggestionValue);

        let me = this;
        option.addEventListener('click', function (event) {
            if (suggestionText == me.options.noMatchesText) {
                return true;
            }

            if (this.classList.contains('token-autocomplete-suggestion-active')) {
                me.removeTokenWithText(suggestionText);
            } else {
                me.addToken(suggestionValue, suggestionText);
            }
            me.clearSuggestions();
            me.hideSuggestions();
            me.clearCurrentInput();
        });

        if (this.container.querySelector('.token-autocomplete-token[data-text="' + suggestionText + '"]') !== null) {
            option.classList.add('token-autocomplete-suggestion-active');
        }

        this.suggestions.appendChild(option);
        this.showSuggestions();

        this.log('added suggestion', suggestionText);
    }
}