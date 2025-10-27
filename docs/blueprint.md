# **App Name**: Royal Grid Domination

## Core Features:

- Grid Generation: Automatically generate an n*n grid with randomized card values (suits and numbers from 'A' to 'n')
- King Placement: Randomly place kings (player indicators) on cells marked with 'A' cards at the beginning of the game.
- King Movement: Enable players to move their king a maximum number of cells, which is the numerical value of his grid position based on the card. Moves can be vertical or horizontal only and can wrap around the edges. A king can't land on a cell occupied by another king. Once a king leaves a spot, that spot becomes invalid and displays the back of a playing card.
- Move Validation: Ensure the player's move distance is valid (no further than allowed by cell number) and the destination is not occupied or invalid.
- Last Move Wins: Determine that the last player who successfully makes a move wins the game.

## Style Guidelines:

- Primary color: Deep red (#8B0000) inspired by high contrast playing card suits
- Background color: Light gray (#D3D3D3), a desaturated, bright color with the same hue as the primary.
- Accent color: Dark blue (#00008B), a contrasting color analogous to deep red
- Body and headline font: 'Literata' (serif) for a readable, vintage-inspired aesthetic that reinforces the game's connection with traditional playing cards.
- Use standard playing card suits for card value visualization and king indicator design. Also, use the back of a playing card to show when a cell has become invalid.
- Grid-based layout for clear and intuitive game representation.
- Subtle animation upon successful king movement, emphasizing the impact of the move