// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";

contract JoKenPo {
    enum Choice {
        NENHUM,
        PEDRA,
        PAPEL,
        TESOURA
    }

    struct Player {
        address player;
        Choice choice;
    }

    Player player1;
    Player player2;

    string public status = "";

    function enumToString(Choice value)
        internal
        pure
        returns (string memory e)
    {
        if (value == Choice.PEDRA) {
            return "PEDRA";
        } else if (value == Choice.PAPEL) {
            return "PAPEL";
        } else if (value == Choice.TESOURA) {
            return "TESOURA";
        } else if (value == Choice.NENHUM) {
            return "NENHUM";
        }
    }

    function choose(Choice newChoice) private {
        if (msg.sender == player1.player || player1.player == address(0)) {
            player1.choice = newChoice;
            player1.player = msg.sender;
        } else {
            player2.choice = newChoice;
            player2.player = msg.sender;
        }

        status = string.concat(
            "Player ",
            Strings.toHexString(msg.sender),
            " choose ",
            enumToString(newChoice)
        );
    }

    function choosePedra() public {
        choose(Choice.PEDRA);
    }

    function choosePapel() public {
        choose(Choice.PAPEL);
    }

    function chooseTesoura() public {
        choose(Choice.TESOURA);
    }

    function play() public {
        string memory message1 = string.concat("Player 1 not choose");
        require(player1.choice != Choice.NENHUM, message1);

        string memory message2 = string.concat("Player 2 not choose");
        require(player2.choice != Choice.NENHUM, message2);

        string memory message = string.concat(
            "Player 1 chose ",
            enumToString(player1.choice),
            " and player 2 chose ",
            enumToString(player2.choice)
        );

        if (player1.choice == player2.choice) {
            status = "It's a tie! Both players chose";
        } else if (
            (player1.choice == Choice.PEDRA &&
                player2.choice == Choice.TESOURA) ||
            (player1.choice == Choice.PAPEL &&
                player2.choice == Choice.PEDRA) ||
            (player1.choice == Choice.TESOURA && player2.choice == Choice.PAPEL)
        ) {
            status = string.concat("Player 1 wins! ", message);
        } else {
            status = string.concat("Player 2 wins! ", message);
        }

        player1.choice = Choice.NENHUM;
        player1.player = address(0);

        player2.choice = Choice.NENHUM;
        player2.player = address(0);
    }
}
