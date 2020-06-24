> # Notice
> Active development has been moved to the following fork: [scireum/token-autocomplete](https://github.com/scireum/token-autocomplete).
> Please understand that only issues created [there](https://github.com/scireum/token-autocomplete/issues) will be investigated.


# Vanilla JS Token Autocomplete Input

Small demo: [click here](https://sabieber.github.io/token-autocomplete/)

## Parameters


| Name | Description | Default |
|---|---|---|
| selector | A selector query string pointing to the div the field should be rendered in | '' |
| name | The name that should be used for the hidden input and when sending the selection as form parameters | '' |
| noMatchesText | An optional text that will be displayed when no suggestions were found for the text input | null |
| initialTokens | An optional array of strings for the initial tokens when initial option elements arent provided | null |
| initialSuggestions | An optional array of strings for the initial autocomplete suggestions when initial option elements arent provided | null |
| minCharactersForSuggestion | The minimum number of letters the user has to enter after which autocompletion is triggered | 1 |
