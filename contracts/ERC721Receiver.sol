// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IERC721Receiver.sol";
import "./ERC165.sol";

/**
 * @dev _Available since v3.1._
 */
abstract contract ERC721Receiver is ERC165, IERC721Receiver {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
