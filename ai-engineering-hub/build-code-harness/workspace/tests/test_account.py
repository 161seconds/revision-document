import pytest
from account import BankAccount, InsufficientFunds


def test_deposit_increases_balance():
    acct = BankAccount("alice", 100)
    acct.deposit(50)
    assert acct.balance == 150


def test_withdraw_decreases_balance():
    acct = BankAccount("alice", 100)
    acct.withdraw(40)
    assert acct.balance == 60


def test_overdraft_is_blocked():
    acct = BankAccount("alice", 100)
    with pytest.raises(InsufficientFunds):
        acct.withdraw(150)
    assert acct.balance == 100 


def test_transfer_moves_money_between_accounts():
    alice = BankAccount("alice", 100)
    bob = BankAccount("bob", 0)
    alice.transfer(bob, 30)
    assert alice.balance == 70
    assert bob.balance == 30


def test_transfer_respects_overdraft():
    alice = BankAccount("alice", 20)
    bob = BankAccount("bob", 0)
    with pytest.raises(InsufficientFunds):
        alice.transfer(bob, 50)
    assert alice.balance == 20
    assert bob.balance == 0
