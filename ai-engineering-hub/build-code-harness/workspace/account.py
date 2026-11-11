"""A tiny double-entry-ish bank account."""


class InsufficientFunds(Exception):
    pass


class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance -= amount
        self.history.append(("withdraw", amount))

    def transfer(self, other, amount):
        self.withdraw(amount)
        self.deposit(amount)
